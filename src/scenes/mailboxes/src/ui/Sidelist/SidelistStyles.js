import './SidelistStyles.less'
const Colors = require('material-ui/styles/colors')
const FOOTER_HEIGHT = 100

module.exports = {
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
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: FOOTER_HEIGHT,
    overflowY: 'auto',
    overflowX: 'hidden'
  },
  itemContainer: {
    textAlign: 'center'
  },
  mailboxItemContainer: {
    marginTop: 10,
    marginBottom: 10,
    position: 'relative',
    cursor: 'pointer'
  },
  mailboxAvatar: {
    borderWidth: 3,
    borderStyle: 'solid'
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
    WebkitUserSelect: 'none'
  },
  mailboxBadgeContainer: {
    position: 'absolute',
    top: -3,
    right: 3
  },
  mailboxActiveIndicator: {
    position: 'absolute',
    left: 2,
    top: '50%',
    width: 6,
    height: 6,
    marginTop: -3,
    borderRadius: '50%'
  }
}
