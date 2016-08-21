module.exports = {
  /* **************************************************************************/
  // Modal
  /* **************************************************************************/
  dialog: {
    width: '90%',
    maxWidth: 1200
  },
  tabToggles: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'stretch'
  },
  tabToggle: {
    height: 50,
    borderRadius: 0,
    flex: 1,
    borderBottomWidth: 2,
    borderBottomStyle: 'solid'
  },

  /* **************************************************************************/
  // General
  /* **************************************************************************/
  paper: {
    padding: 15,
    marginBottom: 5,
    marginTop: 5
  },
  subheading: {
    marginTop: 0,
    marginBottom: 10,
    color: '#CCC',
    fontWeight: '300',
    fontSize: 16
  },
  fileInputButton: {
    marginRight: 15,
    position: 'relative',
    overflow: 'hidden'
  },
  fileInput: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    bottom: -100,
    opacity: 0,
    zIndex: 100
  },

  /* **************************************************************************/
  // Account
  /* **************************************************************************/

  accountPicker: {
    position: 'relative',
    height: 100
  },
  accountPickerAvatar: {
    position: 'absolute',
    top: 20,
    left: 20
  },
  accountPickerContainer: {
    position: 'absolute',
    top: 25,
    left: 100,
    right: 0
  }
}
