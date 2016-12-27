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
}

module.exports = GinboxApi
