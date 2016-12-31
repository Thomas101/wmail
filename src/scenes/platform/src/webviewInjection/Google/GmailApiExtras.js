const escapeHTML = require('../../../../app/node_modules/escape-html')

class GmailApiExtras {
  /**
  * Handles opening the compose ui and prefills relevant items
  * @param gmailApi: the gmail api
  * @param data: the data that was sent with the event
  */
  static composeMessage (gmailApi, data) {
    if (!gmailApi) { return }

    gmailApi.compose.start_compose()

    if (data.recipient || data.subject || data.body) {
      setTimeout(() => {
        // Grab elements
        const subjectEl = Array.from(document.querySelectorAll('[name="subjectbox"]')).slice(-1)[0]
        if (!subjectEl) { return }
        const dialogEl = subjectEl.closest('[role="dialog"]')
        if (!dialogEl) { return }
        const bodyEl = dialogEl.querySelector('[g_editable="true"][role="textbox"]')
        const recipientEl = dialogEl.querySelector('[name="to"]')
        let focusableEl

        // Recipient
        if (data.recipient && recipientEl) {
          recipientEl.value = escapeHTML(data.recipient)
          focusableEl = subjectEl
        }

        // Subject
        if (data.subject && subjectEl) {
          subjectEl.value = escapeHTML(data.subject)
          focusableEl = bodyEl
        }

        // Body
        if (data.body && bodyEl) {
          bodyEl.innerHTML = escapeHTML(data.body) + bodyEl.innerHTML
          focusableEl = bodyEl
        }

        if (focusableEl) {
          setTimeout(() => focusableEl.focus(), 500)
        }
      })
    }
  }
}

module.exports = GmailApiExtras
