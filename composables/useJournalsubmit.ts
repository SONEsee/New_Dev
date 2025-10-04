// composables/useJournalSubmit.js
// Enhanced journal submission with retry logic and conflict handling

import { ref } from 'vue'
import axios from '@/helpers/axios'
import Swal from 'sweetalert2'

export const useJournalSubmit = () => {
  const isSubmitting = ref(false)
  const retryCount = ref(0)
  const maxRetries = 3

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    }
  })

  const submitWithRetry = async (payload, attempt = 1) => {
    try {
      const response = await axios.post(
        '/api/journal-entries/batch_create/',
        payload,
        getAuthHeaders()
      )
      
      return {
        success: true,
        data: response.data,
        attempt
      }
    } catch (error) {
      // Handle duplicate reference error (409 Conflict)
      if (error.response?.status === 409) {
        if (attempt < maxRetries) {
          console.warn(`Conflict detected, retry attempt ${attempt}/${maxRetries}`)
          
          // Show retry notification
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'info',
            title: `ກຳລັງລອງໃໝ່... (${attempt}/${maxRetries})`,
            text: 'ເລກອ້າງອີງຊ້ຳກັນ, ກຳລັງສ້າງເລກໃໝ່',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          })

          // Wait with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
          await new Promise(resolve => setTimeout(resolve, delay))

          // Remove the Reference_No to force auto-generation
          const retryPayload = { ...payload }
          delete retryPayload.Reference_No

          // Retry the request
          return submitWithRetry(retryPayload, attempt + 1)
        } else {
          return {
            success: false,
            error: 'duplicate_reference',
            message: 'ບໍ່ສາມາດສ້າງເລກອ້າງອີງທີ່ບໍ່ຊ້ຳກັນໄດ້ຫຼັງຈາກພະຍາຍາມຫຼາຍຄັ້ງ',
            detail: error.response?.data
          }
        }
      }

      // Handle other errors
      return {
        success: false,
        error: 'submission_failed',
        message: error.response?.data?.error || 'ເກີດຂໍ້ຜິດພາດໃນການບັນທຶກ',
        detail: error.response?.data
      }
    }
  }

  const handleSubmit = async (journalData, journalEntries, exchangeRate, currencies) => {
    if (isSubmitting.value) {
      return { success: false, error: 'already_submitting' }
    }

    isSubmitting.value = true
    retryCount.value = 0

    try {
      // Show initial loading
      const loadingAlert = Swal.fire({
        title: 'ກຳລັງບັນທຶກ...',
        html: 'ກະລຸນາລໍຖ້າ, ກຳລັງປະມວນຜົນລາຍການບັນທຶກ',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading()
        }
      })

      // Build payload
      const selectedCurrency = currencies.find(c => c.ccy_code === journalData.Ccy_cd)
      const altCcyCode = selectedCurrency?.ALT_Ccy_Code || ''

      const batchPayload = {
        Reference_No: journalData.Reference_No,
        Ccy_cd: journalData.Ccy_cd,
        Txn_code: journalData.Txn_code,
        Value_date: journalData.Value_date + 'T00:00:00Z',
        Addl_text: journalData.Addl_text || '',
        Addl_sub_text: journalData.Addl_sub_text || '',
        fin_cycle: journalData.fin_cycle || null,
        Period_code: journalData.Period_code || null,
        module_id: journalData.module_id || 'GL',
        entries: []
      }

      // Build entries
      journalEntries.forEach(entry => {
        const amount = parseFloat(entry.Fcy_Amount) || 0
        if (amount <= 0) return

        const buildAccountNo = (accountId, accounts, debitAccounts, creditAccounts) => {
          const account = 
            debitAccounts.find(a => a.glsub_id === accountId) ||
            creditAccounts.find(a => a.glsub_id === accountId) ||
            accounts.find(a => a.glsub_id === accountId)
          
          let code = account ? account.glsub_code : ''
          if (altCcyCode && code) {
            code = `${altCcyCode}.${code}`
          }
          return code
        }

        if (entry.DebitAccount) {
          batchPayload.entries.push({
            Account: entry.DebitAccount,
            Account_no: entry.DebitAccount, // Will be built on backend
            Amount: amount,
            Dr_cr: 'D',
            Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',
            Ac_relatives: entry.CreditAccount
          })
        }

        if (entry.CreditAccount) {
          batchPayload.entries.push({
            Account: entry.CreditAccount,
            Account_no: entry.CreditAccount, // Will be built on backend
            Amount: amount,
            Dr_cr: 'C',
            Addl_sub_text: entry.Addl_sub_text || batchPayload.Addl_sub_text || '',
            Ac_relatives: entry.DebitAccount
          })
        }
      })

      // Validate entries exist
      if (batchPayload.entries.length === 0) {
        Swal.close()
        await Swal.fire({
          icon: 'warning',
          title: 'ບໍ່ມີລາຍການ',
          text: 'ກະລຸນາເພີ່ມລາຍການບັນທຶກກ່ອນບັນທຶກ',
          confirmButtonText: 'ຕົກລົງ'
        })
        return { success: false, error: 'no_entries' }
      }

      // Validate balance
      const totalDebit = batchPayload.entries
        .filter(e => e.Dr_cr === 'D')
        .reduce((sum, e) => sum + e.Amount, 0)
      const totalCredit = batchPayload.entries
        .filter(e => e.Dr_cr === 'C')
        .reduce((sum, e) => sum + e.Amount, 0)

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        Swal.close()
        await Swal.fire({
          icon: 'error',
          title: 'ບໍ່ສົມດຸນ',
          html: `
            <div style="text-align: left;">
              <p>ລາຍການບັນທຶກບໍ່ສົມດຸນ:</p>
              <p><strong>ເດບິດລວມ:</strong> ${totalDebit.toFixed(2)}</p>
              <p><strong>ເຄຣດິດລວມ:</strong> ${totalCredit.toFixed(2)}</p>
              <p><strong>ຕ່າງ:</strong> ${Math.abs(totalDebit - totalCredit).toFixed(2)}</p>
            </div>
          `,
          confirmButtonText: 'ຕົກລົງ'
        })
        return { success: false, error: 'not_balanced' }
      }

      // Submit with retry logic
      const result = await submitWithRetry(batchPayload)

      Swal.close()

      if (result.success) {
        // Show success message
        const response = result.data
        
        await Swal.fire({
          icon: 'success',
          title: 'ສຳເລັດ!',
          html: `
            <div style="text-align: left; padding: 10px;">
              <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-bottom: 10px;">
                <p style="margin: 5px 0;">
                  <strong>ເລກອ້າງອີງ:</strong> 
                  <span style="color: #1976d2;">${response.reference_no}</span>
                </p>
                <p style="margin: 5px 0;">
                  <strong>ລາຍການທີ່ສ້າງ:</strong> ${response.entries_created}
                </p>
                ${result.attempt > 1 ? `
                  <p style="margin: 5px 0; color: #ff9800;">
                    <strong>ພະຍາຍາມ:</strong> ${result.attempt} ຄັ້ງ
                  </p>
                ` : ''}
              </div>
              <div style="background: #fff3e0; padding: 15px; border-radius: 8px;">
                <p style="margin: 5px 0;">
                  <strong>ເດບິດລວມ:</strong> ${totalDebit.toFixed(2)} ${journalData.Ccy_cd}
                </p>
                <p style="margin: 5px 0;">
                  <strong>ເຄຣດິດລວມ:</strong> ${totalCredit.toFixed(2)} ${journalData.Ccy_cd}
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'ຕົກລົງ',
          timer: 10000,
          timerProgressBar: true,
        })

        return {
          success: true,
          data: response,
          retries: result.attempt - 1
        }
      } else {
        // Show error message
        await Swal.fire({
          icon: 'error',
          title: 'ຂໍ້ຜິດພາດ',
          html: `
            <div style="text-align: left;">
              <p><strong>ຂໍ້ຜິດພາດ:</strong> ${result.message}</p>
              ${result.detail ? `
                <p style="margin-top: 10px; font-size: 12px; color: #666;">
                  <strong>ລາຍລະອຽດ:</strong><br>
                  ${JSON.stringify(result.detail, null, 2)}
                </p>
              ` : ''}
            </div>
          `,
          confirmButtonText: 'ຕົກລົງ'
        })

        return result
      }
    } catch (error) {
      Swal.close()
      
      console.error('Unexpected error:', error)
      await Swal.fire({
        icon: 'error',
        title: 'ຂໍ້ຜິດພາດທີ່ບໍ່ຄາດຄິດ',
        text: 'ກະລຸນາລອງໃໝ່ອີກຄັ້ງ ຫຼື ຕິດຕໍ່ຜູ້ດູແລລະບົບ',
        confirmButtonText: 'ຕົກລົງ'
      })

      return {
        success: false,
        error: 'unexpected_error',
        detail: error
      }
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    handleSubmit,
    isSubmitting,
    retryCount
  }
}