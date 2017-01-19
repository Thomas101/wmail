const React = require('react')
const { mailboxStore, mailboxActions } = require('../../stores/mailbox')
const { settingsStore } = require('../../stores/settings')
const { ipcRenderer } = window.nativeRequire('electron')
const {mailboxDispatch, navigationDispatch} = require('../../Dispatch')
const { WebView } = require('../../Components')
const MailboxSearch = require('./MailboxSearch')
const MailboxTargetUrl = require('./MailboxTargetUrl')
const shallowCompare = require('react-addons-shallow-compare')

const BROWSER_REF = 'browser'
const SEARCH_REF = 'search'

module.exports = React.createClass({

  /* **************************************************************************/
  // Class
  /* **************************************************************************/

  displayName: 'MailboxTab',
  propTypes: Object.assign({
    mailboxId: React.PropTypes.string.isRequired,
    service: React.PropTypes.string.isRequired,
    preload: React.PropTypes.string,
    src: React.PropTypes.string
  }, WebView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
    acc[name] = React.PropTypes.func
    return acc
  }, {})),

  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  componentDidMount () {
    // Stores
    mailboxStore.listen(this.mailboxesChanged)
    settingsStore.listen(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.on('devtools', this.handleOpenDevTools)
    mailboxDispatch.on('refocus', this.handleRefocus)
    mailboxDispatch.on('reload', this.handleReload)
    mailboxDispatch.respond('fetch-process-memory-info', this.handleFetchProcessMemoryInfo)
    ipcRenderer.on('mailbox-window-find-start', this.handleIPCSearchStart)
    ipcRenderer.on('mailbox-window-find-next', this.handleIPCSearchNext)
    ipcRenderer.on('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.on('mailbox-window-navigate-forward', this.handleIPCNavigateForward)

    // Autofocus on the first run
    if (this.state.isActive) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  },

  componentWillUnmount () {
    // Stores
    mailboxStore.unlisten(this.mailboxesChanged)
    settingsStore.unlisten(this.settingsChanged)

    // Handle dispatch events
    mailboxDispatch.off('devtools', this.handleOpenDevTools)
    mailboxDispatch.off('refocus', this.handleRefocus)
    mailboxDispatch.off('reload', this.handleReload)
    mailboxDispatch.unrespond('fetch-process-memory-info', this.handleFetchProcessMemoryInfo)
    ipcRenderer.removeListener('mailbox-window-find-start', this.handleIPCSearchStart)
    ipcRenderer.removeListener('mailbox-window-find-next', this.handleIPCSearchNext)
    ipcRenderer.removeListener('mailbox-window-navigate-back', this.handleIPCNavigateBack)
    ipcRenderer.removeListener('mailbox-window-navigate-forward', this.handleIPCNavigateForward)
  },

  componentWillReceiveProps (nextProps) {
    if (this.props.mailboxId !== nextProps.mailboxId || this.props.service !== nextProps.service || this.props.src !== nextProps.src) {
      this.setState(this.getInitialState(nextProps))
    }
  },

  /* **************************************************************************/
  // Data lifecycle
  /* **************************************************************************/

  getInitialState (props = this.props) {
    const mailboxState = mailboxStore.getState()
    const mailbox = mailboxState.getMailbox(props.mailboxId)
    const settingState = settingsStore.getState()

    const isActive = mailboxState.isActive(props.mailboxId, props.service)
    return {
      mailbox: mailbox,
      isActive: isActive,
      isSearching: mailboxState.isSearchingMailbox(props.mailboxId, props.service),
      browserSrc: props.src || mailbox.resolveServiceUrl(props.service),
      language: settingState.language,
      focusedUrl: null
    }
  },

  mailboxesChanged (mailboxState) {
    const { mailboxId, service } = this.props
    const mailbox = mailboxState.getMailbox(mailboxId)
    if (mailbox) {
      this.setState((prevState) => {
        const isActive = mailboxState.isActive(mailboxId, service)

        // Submit zoom state
        if (prevState.mailbox.zoomFactor !== mailbox.zoomFactor) {
          this.refs[BROWSER_REF].setZoomLevel(mailbox.zoomFactor)
        }

        // Return state
        return {
          mailbox: mailbox,
          isActive: isActive,
          isSearching: mailboxState.isSearchingMailbox(mailboxId, service),
          browserSrc: mailbox.resolveServiceUrl(service)
        }
      })
    } else {
      this.setState({ mailbox: null })
    }
  },

  settingsChanged (settingsState) {
    this.setState((prevState) => {
      if (settingsState.language !== prevState.language) {
        const prevLanguage = prevState.language
        const nextLanguage = settingsState.language

        if (prevLanguage.spellcheckerLanguage !== nextLanguage.spellcheckerLanguage || prevLanguage.secondarySpellcheckerLanguage !== nextLanguage.secondarySpellcheckerLanguage) {
          this.refs[BROWSER_REF].send('start-spellcheck', {
            language: nextLanguage.spellcheckerLanguage,
            secondaryLanguage: nextLanguage.secondarySpellcheckerLanguage
          })
        }

        return { language: nextLanguage }
      } else {
        return undefined
      }
    })
  },

  /* **************************************************************************/
  // Webview pass throughs
  /* **************************************************************************/

  send () { return this.refs[BROWSER_REF].send.apply(this, Array.from(arguments)) },
  sendWithResponse () { return this.refs[BROWSER_REF].sendWithResponse.apply(this, Array.from(arguments)) },

  /* **************************************************************************/
  // Dispatcher Events
  /* **************************************************************************/

  /**
  * Handles the inspector dispatch event
  * @param evt: the event that fired
  */
  handleOpenDevTools (evt) {
    if (evt.mailboxId === this.props.mailboxId) {
      if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].openDevTools()
      } else if (evt.service === this.props.service) {
        this.refs[BROWSER_REF].openDevTools()
      }
    }
  },

  /**
  * Handles refocusing the mailbox
  * @param evt: the event that fired
  */
  handleRefocus (evt) {
    if (!evt.mailboxId || !evt.service || (evt.mailboxId === this.props.mailboxId && evt.service === this.props.service)) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }
  },

  /**
  * Handles reloading the mailbox
  * @param evt: the event that fired
  */
  handleReload (evt) {
    if (evt.mailboxId === this.props.mailboxId) {
      if (evt.allServices) {
        this.refs[BROWSER_REF].reload()
      } else if (!evt.service && this.state.isActive) {
        this.refs[BROWSER_REF].reload()
      } else if (evt.service === this.props.service) {
        this.refs[BROWSER_REF].reload()
      }
    }
  },

  /**
  * Fetches the webviews process memory info
  * @return promise
  */
  handleFetchProcessMemoryInfo () {
    return this.refs[BROWSER_REF].getProcessMemoryInfo().then((memoryInfo) => {
      return Promise.resolve({
        mailboxId: this.props.mailboxId,
        memoryInfo: memoryInfo
      })
    })
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Calls multiple handlers for browser events
  * @param callers: a list of callers to execute
  * @param args: the arguments to supply them with
  */
  multiCallBrowserEvent (callers, args) {
    callers.forEach((caller) => {
      if (caller) {
        caller.apply(this, args)
      }
    })
  },

  /* **************************************************************************/
  // Browser Events : Dispatcher
  /* **************************************************************************/

  /**
  * Dispatches browser IPC messages to the correct call
  * @param evt: the event that fired
  */
  dispatchBrowserIPCMessage (evt) {
    switch (evt.channel.type) {
      case 'open-settings': navigationDispatch.openSettings(); break
      default: break
    }
  },

  /* **************************************************************************/
  // Browser Events
  /* **************************************************************************/

  /**
  * Handles the Browser DOM becoming ready
  */
  handleBrowserDomReady () {
    // Push the settings across
    this.refs[BROWSER_REF].setZoomLevel(this.state.mailbox.zoomFactor)

    // Language
    const languageSettings = this.state.language
    if (languageSettings.spellcheckerEnabled) {
      this.refs[BROWSER_REF].send('start-spellcheck', {
        language: languageSettings.spellcheckerLanguage,
        secondaryLanguage: languageSettings.secondarySpellcheckerLanguage
      })
    }

    // Push the custom user content
    if (this.state.mailbox.hasCustomCSS || this.state.mailbox.hasCustomJS) {
      this.refs[BROWSER_REF].send('inject-custom-content', {
        css: this.state.mailbox.customCSS,
        js: this.state.mailbox.customJS
      })
    }
  },

  /**
  * Updates the target url that the user is hovering over
  * @param evt: the event that fired
  */
  handleBrowserUpdateTargetUrl (evt) {
    this.setState({ focusedUrl: evt.url !== '' ? evt.url : null })
  },

  /* **************************************************************************/
  // Browser Events : Navigation
  /* **************************************************************************/

  /**
  * Handles a browser preparing to navigate
  * @param evt: the event that fired
  */
  handleBrowserWillNavigate (evt) {
    // the lamest protection again dragging files into the window
    // but this is the only thing I could find that leaves file drag working
    if (evt.url.indexOf('file://') === 0) {
      this.setState({ browserSrc: this.state.mailbox.resolveServiceUrl(this.props.service) })
    }
  },

  /* **************************************************************************/
  // Browser Events : Focus
  /* **************************************************************************/

  /**
  * Handles a browser focusing
  */
  handleBrowserFocused () {
    mailboxDispatch.focused(this.props.mailboxId, this.props.service)
  },

  /**
  * Handles a browser un-focusing
  */
  handleBrowserBlurred () {
    mailboxDispatch.blurred(this.props.mailboxId, this.props.service)
  },

  /* **************************************************************************/
  // UI Events : Search
  /* **************************************************************************/

  /**
  * Handles the search text changing
  * @param str: the search string
  */
  handleSearchChanged (str) {
    if (str.length) {
      this.refs[BROWSER_REF].findInPage(str)
    } else {
      this.refs[BROWSER_REF].stopFindInPage('clearSelection')
    }
  },

  /**
  * Handles searching for the next occurance
  */
  handleSearchNext (str) {
    if (str.length) {
      this.refs[BROWSER_REF].findInPage(str, { findNext: true })
    }
  },

  /**
  * Handles cancelling searching
  */
  handleSearchCancel () {
    mailboxActions.stopSearchingMailbox(this.props.mailboxId, this.props.service)
    this.refs[BROWSER_REF].stopFindInPage('clearSelection')
  },

  /* **************************************************************************/
  // IPC Events
  /* **************************************************************************/

  /**
  * Handles an ipc search start event coming in
  */
  handleIPCSearchStart () {
    if (this.state.isActive) {
      setTimeout(() => { this.refs[SEARCH_REF].focus() })
    }
  },

  /**
  * Handles an ipc search next event coming in
  */
  handleIPCSearchNext () {
    if (this.state.isActive) {
      this.handleSearchNext(this.refs[SEARCH_REF].searchQuery())
    }
  },

  /**
  * Handles navigating the mailbox back
  */
  handleIPCNavigateBack () {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateBack()
    }
  },

  /**
  * Handles navigating the mailbox forward
  */
  handleIPCNavigateForward () {
    if (this.state.isActive) {
      this.refs[BROWSER_REF].navigateForward()
    }
  },

  /* **************************************************************************/
  // Rendering
  /* **************************************************************************/

  shouldComponentUpdate (nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  },

  /**
  * Renders the app
  */
  render () {
    // Extract our props and pass props
    const { isActive, browserSrc, focusedUrl, isSearching, mailbox } = this.state
    const { mailboxId, className, preload, ...passProps } = this.props
    delete passProps.service
    const webviewEventProps = WebView.REACT_WEBVIEW_EVENTS.reduce((acc, name) => {
      acc[name] = this.props[name]
      delete passProps[name]
      return acc
    }, {})

    // See if we should render
    if (!mailbox) { return false }

    // Prep Clasnames and running functions
    const saltedClassName = [
      className,
      'ReactComponent-MailboxTab',
      isActive ? 'active' : undefined
    ].filter((c) => !!c).join(' ')

    if (isActive) {
      setTimeout(() => { this.refs[BROWSER_REF].focus() })
    }

    return (
      <div className={saltedClassName}>
        <WebView
          ref={BROWSER_REF}
          preload={preload}
          partition={'persist:' + mailboxId}
          src={browserSrc}

          {...webviewEventProps}
          domReady={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserDomReady, webviewEventProps.domReady], [evt])
          }}
          ipcMessage={(evt) => {
            this.multiCallBrowserEvent([this.dispatchBrowserIPCMessage, webviewEventProps.ipcMessage], [evt])
          }}
          willNavigate={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserWillNavigate, webviewEventProps.willNavigate], [evt])
          }}
          focus={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserFocused, webviewEventProps.focus], [evt])
          }}
          blur={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserBlurred, webviewEventProps.blur], [evt])
          }}
          updateTargetUrl={(evt) => {
            this.multiCallBrowserEvent([this.handleBrowserUpdateTargetUrl, webviewEventProps.updateTargetUrl], [evt])
          }} />
        <MailboxTargetUrl url={focusedUrl} />
        <MailboxSearch
          ref={SEARCH_REF}
          isSearching={isSearching}
          onSearchChange={this.handleSearchChanged}
          onSearchNext={this.handleSearchNext}
          onSearchCancel={this.handleSearchCancel} />
      </div>
    )
  }
})
