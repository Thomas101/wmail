const escapeHTML = require('../../../../app/node_modules/escape-html')

class GinboxApi {

  /**
  * Gets the visible unread count. Ensures that clusters are only counted once/
  * May throw a dom exception if things go wrong
  * @return the unread count
  */
  static getVisibleUnreadCount () {
    const unread = Array.from(document.querySelectorAll('[data-item-id][aria-expanded="false"] [email]')).reduce((acc, elm) => {
      const isUnread = elm.tagName !== 'IMG' && window.getComputedStyle(elm).fontWeight === 'bold'
      if (isUnread) {
        const clusterElm = elm.closest('[data-item-id^="#clusters"]')
        if (clusterElm) {
          acc.openClusters.add(clusterElm)
        } else {
          acc.messages.add(elm)
        }
      }
      return acc
    }, { messages: new Set(), openClusters: new Set() })
    return unread.messages.size + unread.openClusters.size
  }

  /**
  * Checks if the inbox tab is visble
  * May throw a dom exception if things go wrong
  * @return true or false
  */
  static isInboxTabVisible () {
    const elm = document.querySelector('nav [role="menuitem"]') // The first item
    return window.getComputedStyle(elm).backgroundColor.substr(-4) !== ', 0)'
  }

  /**
  * Checks if the pinned setting is toggled
  * May throw a dom exception if things go wrong
  * @return true or false
  */
  static isInboxPinnedToggled () {
    const elm = document.querySelector('[jsaction="global.toggle_pinned"]')
    return elm ? elm.getAttribute('aria-pressed') === 'true' : false
  }

  /**
  * Handles opening the compose ui and prefills relevant items
  * @param data: the data that was sent with the event
  */
  static composeMessage (data) {
    const composeButton = document.querySelector('button.y.hC') || document.querySelector('[jsaction="jsl._"]')
    if (!composeButton) { return }
    composeButton.click()

    setTimeout(() => {
      // Grab elements
      const bodyEl = document.querySelector('[g_editable="true"][role="textbox"]')
      if (!bodyEl) { return }
      const dialogEl = bodyEl.closest('[role="dialog"]')
      if (!dialogEl) { return }
      const recipientEl = dialogEl.querySelector('input') // first input
      const subjectEl = dialogEl.querySelector('[jsaction*="subject"]')
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
        const labelEl = bodyEl.parentElement.querySelector('label')
        if (labelEl) { labelEl.style.display = 'none' }
        focusableEl = bodyEl
      }

      if (focusableEl) {
        setTimeout(() => focusableEl.focus(), 500)
      }
    })
  }
}

module.exports = GinboxApi
