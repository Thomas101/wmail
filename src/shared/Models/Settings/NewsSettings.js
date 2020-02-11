const Model = require('../Model')

class NewsSettings extends Model {
  get newsId () { return this._value_('newsId', 0) }
  get newsLevel () { return this._value_('newsLevel', 'none') }
  get newsFeed () { return this._value_('newsFeed', undefined) }
  get openedNewsId () { return this._value_('openedNewsId', 0) }

  get hasUpdateInfo () { return !!this.newsFeed }
  get hasUnopenedNewsId () { return this.openedNewsId < this.newsId }
  get showNewsInSidebar () { return this._value_('showNewsInSidebar', true) }
}

module.exports = NewsSettings
