import './SidelistStyles.less'
const Colors = require('material-ui/styles/colors')
const FOOTER_HEIGHT = 100
const FOOTER_HEIGHT_WIZARD = 150

module.exports = {
  /**
  * Layout
  */
  container: {
    backgroundColor: Colors.blueGrey900,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  footer: {
    height: FOOTER_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  footerWithWizard: {
    height: FOOTER_HEIGHT_WIZARD
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: FOOTER_HEIGHT,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  scrollerWithWizard: {
    bottom: FOOTER_HEIGHT_WIZARD
  },
  itemContainer: {
    textAlign: 'center'
  },

  /**
  * Mailbox Item
  */
  mailboxItemContainer: {
    marginTop: 10,
    marginBottom: 10,
    position: 'relative'
  },
  mailboxAvatar: {
    borderWidth: 4,
    borderStyle: 'solid',
    cursor: 'pointer'
  },
  mailboxBadge: {
    backgroundColor: 'rgba(238, 54, 55, 0.95)',
    color: Colors.red50,
    fontWeight: '100',
    width: 'auto',
    minWidth: 24,
    paddingLeft: 4,
    paddingRight: 4,
    borderRadius: 12,
    WebkitUserSelect: 'none',
    cursor: 'pointer'
  },
  mailboxBadgeContainer: {
    position: 'absolute',
    top: -3,
    right: 3,
    cursor: 'pointer'
  },
  mailboxActiveIndicator: {
    position: 'absolute',
    left: 2,
    top: 25,
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%',
    cursor: 'pointer'
  },

  /**
  * Mailbox Item: Services
  */
  mailboxServiceIcons: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 2,
    marginRight: 2
  },
  mailboxServiceIcon: {
    cursor: 'pointer',
    flexBasis: '100%',
    padding: 2
  },
  mailboxServiceIconImage: {
    maxWidth: '100%'
  }
}
