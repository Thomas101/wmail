const alt = require('../alt')
const actions = require('./httpActions')

class HttpStore {
  /* **************************************************************************/
  // Lifecycle
  /* **************************************************************************/

  constructor () {
    this.requests = new Map()

    /* ****************************************/
    // Requests
    /* ****************************************/

    /**
    * @param id: the id of the task
    * @return true if this task is inflight
    */
    this.isInflight = (id) => {
      return this.tasks.has(id) ? this.tasks.get(id).inflight : false
    }

    /**
    * @param id: the id of the task
    * @return the completion error, or undefined if none
    */
    this.error = (id) => {
      return this.tasks.has(id) ? this.tasks.get(id).error : undefined
    }

    /**
    * @param id: the id of the task
    * @return the completion response, or undefined if none
    */
    this.response = (id) => {
      return this.tasks.has(id) ? this.tasks.get(id).response : undefined
    }

    /* ****************************************/
    // Listeners
    /* ****************************************/

    this.bindListeners({
      handleFetchText: actions.FETCH_TEXT,
      handleRequestSuccess: actions.REQUEST_SUCCESS,
      handleRequestFailure: actions.REQUEST_FAILURE,
      handleClearResponse: actions.CLEAR_RESPONSE
    })
  }

  /* **************************************************************************/
  // Handlers: Fetch
  /* **************************************************************************/

  handleFetchText ({ id }) {
    this.tasks.set(id, { inflight: true })
  }

  handleRequestSuccess ({ id, data }) {
    this.tasks.set(id, { inflight: false, response: data })
  }

  handleRequestFailure ({ id, error }) {
    this.tasks.set(id, { inflight: false, error: error })
  }

  handleClearResponse ({ id }) {
    this.tasks.delete(id)
  }
}

module.exports = alt.createStore(HttpStore, 'HttpStore')
