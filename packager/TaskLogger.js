class TaskLogger {
  /* ****************************************************************************/
  // Class
  /* ****************************************************************************/

  /**
  * Creates a new task
  * @param name: the name of the task
  * @return the created task
  */
  static start (name) {
    return new TaskLogger(name)
  }

  /* ****************************************************************************/
  // Lifecycle
  /* ****************************************************************************/

  /**
  * @param name: the name of the task
  */
  constructor (name) {
    this.name = name
    this.start = new Date().getTime()
    console.log('[START] ' + name)
  }

  /**
  * Finishes the task
  * @param pass=undefined: variable to pass through to response
  * @return resoled promise
  */
  finish (pass) {
    console.log(`[FINISH] ${this.name} (${(new Date().getTime() - this.start)}ms)`)
    return Promise.resolve(pass)
  }

  /**
  * Fails the task
  * @param pass=undefined: variable to pass through to response
  * @return resoled promise
  */
  fail (pass) {
    console.log(`[FAIL] ${this.name} (${(new Date().getTime() - this.start)}ms)`)
    return Promise.resolve(pass)
  }
}

module.exports = TaskLogger
