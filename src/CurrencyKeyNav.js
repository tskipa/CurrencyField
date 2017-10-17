/**
 * A specialized {@link Ext.util.KeyNav} implementation for navigating a {@link Ext.view.BoundList} using
 * the keyboard. The pageup, pagedown, home, and end keys move the active highlight through
 * the list. The enter key invokes the selection model's select action using the highlighted item.
 */
Ext.define('CurrencyKeyNav', {
  extend: 'Ext.view.BoundListKeyNav',
  alias: 'view.navigation.currencyKeyNav',

  onKeyUp: Ext.emptyFn,

  onKeyDown: Ext.emptyFn,

  onKeyPageDown: function(e) {
    var me = this,
      boundList = me.view,
      allItems = boundList.all,
      oldItem = boundList.highlightedItem,
      oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
      newItemIdx = oldItemIdx < allItems.getCount() - 1 ? oldItemIdx + 1 : 0; //wraps around

    me.setPosition(newItemIdx);

    // Stop this from moving the cursor in the field
    e.preventDefault();
  },

  onKeyPageUp: function(e) {
    var me = this,
      boundList = me.view,
      allItems = boundList.all,
      oldItem = boundList.highlightedItem,
      oldItemIdx = oldItem ? boundList.indexOf(oldItem) : -1,
      newItemIdx = oldItemIdx > 0 ? oldItemIdx - 1 : allItems.getCount() - 1; //wraps around

    me.setPosition(newItemIdx);

    // Stop this from moving the cursor in the field
    e.preventDefault();
  }
});
