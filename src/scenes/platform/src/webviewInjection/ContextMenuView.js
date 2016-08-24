;(function () {
  'use strict'

  const MENU_MIN_WIDTH = 168
  const MENU_MAX_HEIGHT = 350
  const ipcRenderer = require('electron').ipcRenderer

  const ROLES = {
    undo: function () { ipcRenderer.sendToHost({ type: 'undo' }) },
    redo: function () { ipcRenderer.sendToHost({ type: 'redo' }) },
    cut: function () { ipcRenderer.sendToHost({ type: 'cut' }) },
    copy: function () { ipcRenderer.sendToHost({ type: 'copy' }) },
    paste: function () { ipcRenderer.sendToHost({ type: 'paste' }) },
    pasteMatchStyle: function () { ipcRenderer.sendToHost({ type: 'pasteMatchStyle' }) },
    selectall: function () { ipcRenderer.sendToHost({ type: 'selectAll' }) }
  }

  module.exports = function () {
    const self = this
    let DOM

    /* **************************************************************************/
    // Internal UI Events
    /* **************************************************************************/

    /**
    * @param evt: the event that triggered this
    */
    const handleCloseMenu = function (evt) {
      if (evt) {
        evt.preventDefault()
        evt.stopPropagation()
      }
      self.hide()
    }

    /**
    * Dismisses the menu on window resize
    * @param evt: the event that fired
    */
    const handleWindowResize = function (evt) {
      handleCloseMenu()
    }

    /**
    * Dismisses the menu on escape
    * @param evt: the event that fired
    */
    const handleEscapeKey = function (evt) {
      if (evt.keyCode === 27) {
        handleCloseMenu(evt)
      }
    }

    /**
    * Handles the scrollwheel event
    * @param evt: the event that fired
    */
    const handleScrollWheel = function (evt) {
      if (DOM) {
        if (evt.target === DOM.backdrop) {
          evt.preventDefault()
        } else {
          if (evt.deltaY > 0) {
            if (DOM.menu.scrollTop >= DOM.menu.scrollHeight - DOM.menu.clientHeight) {
              evt.preventDefault()
            }
          }
        }
      }
    }

    /* **************************************************************************/
    // Rendering
    /* **************************************************************************/

    /**
    * Renders the menu backdrop
    * @return dom element
    */
    const renderBackdrop = function () {
      const elem = document.createElement('div')
      elem.style.position = 'fixed'
      elem.style.top = '0px'
      elem.style.right = '0px'
      elem.style.bottom = '0px'
      elem.style.left = '0px'
      elem.style.zIndex = 10000
      elem.style.backgroundColor = 'transparent'

      elem.addEventListener('click', handleCloseMenu, false)
      elem.addEventListener('contextmenu', handleCloseMenu, false)

      return elem
    }

    /**
    * Renders the tap element
    * @param x: the x coordinate as a number
    * @param y: the y coordinate as a number
    * @return dom element
    */
    const renderTap = function (x, y) {
      const elem = document.createElement('div')
      elem.style.position = 'fixed'
      elem.style.width = '1px'
      elem.style.height = '1px'
      elem.style.backgroundColor = 'transparent'
      elem.style.overflow = 'visible'
      elem.style.top = y + 'px'
      elem.style.left = x + 'px'
      elem.style.zIndex = 10001

      return elem
    }

    /**
    * Renders the menu
    * @param x: the x coordinate as a number
    * @param y: the y coordinate as a number
    * @return dom element
    */
    const renderMenu = function (x, y) {
      const maxHeight = Math.min(window.outerHeight, MENU_MAX_HEIGHT)

      const elem = document.createElement('div')
      elem.style.position = 'absolute'
      elem.style.zIndex = 10001
      elem.style.backgroundColor = 'white'
      elem.style.minWidth = MENU_MIN_WIDTH + 'px'
      elem.style.maxWidth = window.outerWidth + 'px'
      elem.style.maxHeight = maxHeight + 'px'
      elem.style.opacity = 0
      elem.style.transition = 'opacity 0.25s'
      elem.style.boxShadow = 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px'
      elem.style.borderRadius = '2px'
      elem.style.overflowY = 'auto'
      elem.style.overflowX = 'hidden'
      elem.style.paddingTop = '8px'
      elem.style.paddingBottom = '8px'
      elem.style.boxSizing = 'border-box'

      if (x > window.innerWidth / 2) {
        elem.style.right = '0px'
      } else {
        elem.style.left = '0px'
      }
      if (y > window.innerHeight / 2) {
        if (y < maxHeight) {
          elem.style.bottom = (y - maxHeight) + 'px'
        } else {
          elem.style.bottom = '0px'
        }
      } else {
        elem.style.top = '0px'
      }

      elem.addEventListener('contextmenu', handleCloseMenu, false)

      return elem
    }

    /**
    * Renders the menu contents
    * @param elem: the element to render into
    * @param template: the template to render
    */
    const renderContentsIntoMenu = function (elem, template) {
      // Clear out anything already in the menu
      while (elem.children.length) {
        elem.removeChild(elem.children[0])
      }

      // Add the new menu items in
      template.forEach((templateItem) => {
        let itemElem

        if (templateItem.type === 'separator') {
          itemElem = renderSeparatorMenuItem(templateItem)
        } else {
          itemElem = renderTextMenuItem(templateItem)
        }

        elem.appendChild(itemElem)
      })
    }

    /**
    * Renders a seperator menu item
    * @param template: the template to render from
    * @return dom element
    */
    const renderSeparatorMenuItem = function (template) {
      const elem = document.createElement('hr')
      elem.style.margin = '7px 0px 8px'
      elem.style.height = '1px'
      elem.style.border = 'none'
      elem.style.backgroundColor = 'rgb(224, 224, 224)'

      return elem
    }

    /**
    * Renders a text menu item
    * @param template: the template to render from
    * @return dom element
    */
    const renderTextMenuItem = function (template) {
      const elem = document.createElement('div')
      elem.style.paddingLeft = '16px'
      elem.style.paddingRight = '16px'
      elem.style.cursor = 'pointer'
      elem.style.fontSize = '14px'
      elem.style.lineHeight = '22px'
      elem.style.whiteSpace = 'nowrap'
      elem.style.color = 'rgba(0, 0, 0, 0.870588)'
      elem.style.webkitTapHighlightColor = 'transparent'
      elem.style.webkitUserSelect = 'none'

      elem.textContent = template.label

      if (template.enabled === false) {
        elem.style.color = 'rgba(0, 0, 0, 0.298039)'
        elem.style.cursor = 'default'
      } else {
        elem.addEventListener('mouseover', () => {
          elem.style.backgroundColor = 'rgba(0, 0, 0, 0.0980392)'
        })
        elem.addEventListener('mouseout', () => {
          elem.style.backgroundColor = 'transparent'
        })
      }

      if (template.click) {
        elem.addEventListener('click', (evt) => {
          handleCloseMenu()
          template.click(evt)
        })
      } else if (template.role && ROLES[template.role]) {
        elem.addEventListener('click', (evt) => {
          handleCloseMenu()
          ROLES[template.role](evt)
        })
      }

      return elem
    }

    /* **************************************************************************/
    // Updating
    /* **************************************************************************/

    /**
    * Shows the content menu
    * @param template: the template to render
    * @param x: the x coordinate as a number
    * @param y: the y coordinate as a number
    * @return self
    */
    self.show = function (template, x, y) {
      if (DOM) { return }
      DOM = {
        backdrop: renderBackdrop(),
        tap: renderTap(x, y),
        menu: renderMenu(x, y)
      }
      renderContentsIntoMenu(DOM.menu, template)

      document.body.appendChild(DOM.backdrop)
      document.body.appendChild(DOM.tap)
      DOM.tap.appendChild(DOM.menu)
      window.addEventListener('resize', handleWindowResize, false)
      window.addEventListener('wheel', handleScrollWheel, false)
      document.addEventListener('keyup', handleEscapeKey, false)

      setTimeout(() => {
        DOM.menu.style.opacity = 1
      })

      return self
    }

    /**
    * Hides the content menu
    * @return self
    */
    self.hide = function () {
      if (!DOM) { return }
      const _DOM = DOM
      DOM = undefined

      _DOM.backdrop.parentElement.removeChild(_DOM.backdrop)
      window.removeEventListener('resize', handleWindowResize)
      window.removeEventListener('wheel', handleScrollWheel)
      document.removeEventListener('keyup', handleEscapeKey)

      _DOM.menu.style.opacity = 0
      setTimeout(() => {
        _DOM.tap.parentElement.removeChild(_DOM.tap)
      }, 300)

      return self
    }

    /**
    * Updates the context menu
    * @param template: the template to replace the current one with
    * @return self
    */
    self.update = function (template) {
      if (!DOM) { return }
      renderContentsIntoMenu(DOM.menu, template)
      return self
    }

    return self
  }
})()
