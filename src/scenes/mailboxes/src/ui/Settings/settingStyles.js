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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    width: '100%',
    cursor: 'pointer'
  },
  button: {
    marginTop: 5,
    marginBottom: 5
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
    left: 20,
    boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.117647) 0px 1px 4px' // copied from paper
  },
  accountPickerContainer: {
    position: 'absolute',
    top: 25,
    left: 100,
    right: 0
  }
}
