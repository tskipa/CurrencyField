Ext.define('CurrencyField', {
  extend: 'Ext.form.field.Number',
  alias: 'widget.currencyfield',
  requires: ['Ext.util.KeyNav'],
  mixins: ['Ext.util.StoreHolder'],
  config: {
    displayField: 'text',
    valueField: 'text',
    currencyValue: null,
    readOnlyPicker: false,
    triggers: {
      picker: {
        cls: 'trigger currency',
        handler: 'onTriggerClick',
        hideOnReadOnly: false,
        weight: -1,
        scope: 'this'
      }
    }
  },
  defaultListConfig: {
    loadingHeight: 70,
    minWidth: 70,
    maxHeight: 300,
    shadow: 'sides'
  },
  isPickerField: true,
  matchFieldWidth: true,
  pickerAlign: 'tl-bl?',
  openCls: Ext.baseCSSPrefix + 'pickerfield-open',
  isExpanded: false,
  hasDirtyValue: false,

  initComponent: function() {
    var me = this,
      store = me.store,
      transform = me.transform,
      transformSelect;
    // Build store from 'transform' HTML select element's options
    if (transform) {
      transformSelect = Ext.getDom(transform);
      if (transformSelect) {
        if (!me.store) {
          store = Ext.Array.map(
            Ext.Array.from(transformSelect.options),
            function(option) {
              return [option.value, option.text];
            }
          );
        }
        if (!me.name) {
          me.name = transformSelect.name;
        }
        if (!('value' in me)) {
          me.value = transformSelect.value;
        }
      }
    }
    me.bindStore(store || 'ext-empty-store', true, true);
    me.callParent();
    me.doQueryTask = new Ext.util.DelayedTask(me.doRawQuery, me);
    // render in place of 'transform' select
    if (transformSelect) {
      if (me.transformInPlace) {
        me.render(transformSelect.parentNode, transformSelect);
        delete me.renderTo;
      }
      Ext.removeNode(transformSelect);
    }
  },

  initEvents: function() {
    var me = this;
    me.callParent();
    // Add handlers for keys to expand/collapse the picker
    me.keyNav = new Ext.util.KeyNav(me.inputEl, {
      down: me.onDownArrow,
      esc: {
        handler: me.onEsc,
        scope: me,
        defaultEventAction: false
      },
      scope: me,
      forceKeyDown: true
    });
    // Disable native browser autocomplete
    if (Ext.isGecko) {
      me.inputEl.dom.setAttribute('autocomplete', 'off');
    }
  },

  getStoreListeners: function(store) {
    if (!store.isEmptyStore) {
      var me = this;
      var value = me.getCurrencyValue();
      me.setValueOnData(value);
      var result = {
        load: me.onLoad
      };

      return result;
    }
  },

  applyTriggers: function(triggers) {
    var me = this,
      picker = triggers.picker;

    if (!picker.cls) {
      picker.cls = me.triggerCls;
    }

    return me.callParent([triggers]);
  },

  bindStore: function(store, preventFilter, /* private */ initial) {
    var me = this;
    me.mixins.storeholder.bindStore.call(me, store, initial);
    store = me.getStore();
    if (!initial && store && !store.isEmptyStore) {
      var value = me.getCurrencyValue();
      me.setValueOnData(value);
    }
  },

  setValueOnData: function(currencyValue) {
    var me = this;
    var store = me.getStore();
    if (store.getCount() > 0) {
      var value = me.getValueField();
      var record = currencyValue
        ? store.findRecord(value, currencyValue)
          ? store.findRecord(value, currencyValue)
          : store.first()
        : store.first();
      me.triggerEl.elements[1].dom.setAttribute(
        'data-icon',
        record.data[value]
      );
      me.setCurrencyValue(record.data[value]);
    }
    if (me.isExpanded && store.getCount()) {
      me.doAutoSelect(record);
    }
  },

  doAutoSelect: function(record) {
    var me = this,
      picker = me.picker,
      selectionModel,
      itemNode = 0;
    if (picker && me.store.getCount() > 0) {
      selectionModel = picker.getSelectionModel();
      // Highlight the last selected item and scroll it into view
      if (selectionModel.lastSelected && selectionModel.selected.length) {
        if (selectionModel.getSelection().length === 0) {
          selectionModel.select(record);
        }
        itemNode = selectionModel.lastSelected;
      }
      picker.getNavigationModel().setPosition(itemNode);
    }
  },

  onEsc: function(e) {
    if (Ext.isIE) {
      e.preventDefault();
    }
    if (this.isExpanded) {
      this.collapse();
      e.stopEvent();
    }
  },

  onDownArrow: function(e) {
    if (!this.isExpanded) {
      // Do not let the down arrow event propagate into the picker
      e.stopEvent();
      // Don't call expand() directly as there may be additional processing involved before
      // expanding, e.g. in the case of a ComboBox query.
      this.onTriggerClick();
    }
  },

  expand: function() {
    var me = this,
      bodyEl,
      ariaDom,
      picker,
      doc;

    if (me.rendered && !me.isExpanded && !me.isDestroyed) {
      bodyEl = me.bodyEl;
      picker = me.getPicker();
      doc = Ext.getDoc();
      picker.setMaxHeight(picker.initialConfig.maxHeight);

      if (me.matchFieldWidth) {
        picker.width = me.bodyEl.getWidth();
      }
      // Show the picker and set isExpanded flag. alignPicker only works if isExpanded.
      picker.show();
      var selectionModel = picker.getSelectionModel();
      var store = me.getStore();
      var record = null;
      if (!store.isEmptyStore && store.getCount() > 0) {
        var value = me.getValueField();
        var currencyValue = me.getCurrencyValue();
        record = currencyValue ? store.findRecord(value, currencyValue) : null;
      }
      if (selectionModel.getSelection().length === 0 || !me.hasDirtyValue) {
        record
          ? selectionModel.select(record, false, true)
          : selectionModel.select(0, false, true);
      }
      me.isExpanded = true;
      me.alignPicker();
      bodyEl.addCls(me.openCls);
      // Collapse on touch outside this component tree.
      // Because touch platforms do not focus document.body on touch
      // so no focusleave would occur to trigger a collapse.
      me.touchListeners = doc.on({
        // Do not translate on non-touch platforms.
        // mousedown will blur the field.
        translate: false,
        touchstart: me.collapseIf,
        scope: me,
        delegated: false,
        destroyable: true
      });
      // Scrolling of anything which causes this field to move should collapse
      me.scrollListeners = Ext.on({
        scroll: me.onGlobalScroll,
        scope: me,
        destroyable: true
      });
      // Buffer is used to allow any layouts to complete before we align
      Ext.on('resize', me.alignPicker, me, { buffer: 1 });
      me.fireEvent('expand', me);
      me.onExpand();
    }
  },

  onExpand: Ext.emptyFn,

  alignPicker: function() {
    if (!this.isDestroyed) {
      var picker = this.getPicker();

      if (picker.isVisible() && picker.isFloating()) {
        this.doAlign();
      }
    }
  },

  doAlign: function() {
    var me = this,
      picker = me.picker,
      aboveSfx = '-above',
      isAbove;
    // Align to the trigger wrap because the border isn't always on the input element, which
    // can cause the offset to be off
    me.picker.el.alignTo(me.triggerWrap, me.pickerAlign, me.pickerOffset);
    // add the {openCls}-above class if the picker was aligned above
    // the field due to hitting the bottom of the viewport
    isAbove = picker.el.getY() < me.inputEl.getY();
    me.bodyEl[isAbove ? 'addCls' : 'removeCls'](me.openCls + aboveSfx);
    picker[isAbove ? 'addCls' : 'removeCls'](picker.baseCls + aboveSfx);
  },

  collapse: function() {
    var me = this;
    if (me.isExpanded && !me.isDestroyed && !me.destroying) {
      var openCls = me.openCls,
        picker = me.picker,
        aboveSfx = '-above';
      // hide the picker and set isExpanded flag
      picker.hide();
      me.isExpanded = false;
      // remove the openCls
      me.bodyEl.removeCls([openCls, openCls + aboveSfx]);
      picker.el.removeCls(picker.baseCls + aboveSfx);
      // remove event listeners
      me.touchListeners.destroy();
      me.scrollListeners.destroy();
      Ext.un('resize', me.alignPicker, me);
      me.fireEvent('collapse', me);
      me.onCollapse();
    }
  },

  onCollapse: Ext.emptyFn,

  collapseIf: function(e) {
    var me = this;
    // If what was mousedowned on is outside of this Field, and is not focusable, then collapse.
    // If it is focusable, this Field will blur and collapse anyway.
    if (
      !me.isDestroyed &&
      !e.within(me.bodyEl, false, true) &&
      !me.owns(e.target) &&
      !Ext.fly(e.target).isFocusable()
    ) {
      me.collapse();
    }
  },

  getPicker: function() {
    var me = this,
      picker = me.picker;
    if (!picker) {
      me.creatingPicker = true;
      me.picker = picker = me.createPicker();
      // For upward component searches.
      picker.ownerCmp = me;
      delete me.creatingPicker;
    }
    return me.picker;
  },

  // When focus leaves the picker component, if it's to outside of this
  // Component's hierarchy
  onFocusLeave: function(e) {
    this.collapse();
    this.callParent([e]);
  },

  // The CQ interface. Allow drilling down into the picker when it exists.
  // Important for determining whether an event took place in the bounds of some
  // higher level containing component. See AbstractComponent#owns
  getRefItems: function() {
    var result = [];
    if (this.picker) {
      result[0] = this.picker;
    }
    return result;
  },

  createPicker: function() {
    var me = this,
      picker,
      pickerCfg = Ext.apply(
        {
          xtype: 'boundlist',
          pickerField: me,
          selectionModel: me.pickerSelectionModel,
          floating: true,
          // hidden: true,
          store: me.getPickerStore(),
          displayField: me.displayField,
          preserveScrollOnRefresh: true,
          pageSize: 0,
          tpl: me.tpl
        },
        me.listConfig,
        me.defaultListConfig
      );
    picker = me.picker = Ext.widget(pickerCfg);
    picker.getSelectionModel().on({
      beforeselect: me.onBeforeSelect,
      beforedeselect: me.onBeforeDeselect,
      scope: me
    });
    picker.getNavigationModel().navigateOnSpace = false;
    return picker;
  },

  getPickerStore: function() {
    return this.store;
  },

  onLoad: function(store, records, success) {
    var me = this;
    if (success) {
      var value = me.getCurrencyValue();
      me.setValueOnData(value);
    }
  },

  onBeforeSelect: function(list, record, recordIndex) {
    var me = this;
    var value = me.getValueField();
    me.triggerEl.elements[1].dom.setAttribute('data-icon', record.data[value]);
    me.setCurrencyValue(record.data[value]);
    me.hasDirtyValue = true;
    me.collapse();
    return me.fireEvent('beforeselect', this, record, recordIndex);
  },

  onBeforeDeselect: function(list, record, recordIndex) {
    return this.fireEvent('beforedeselect', this, record, recordIndex);
  },

  onTriggerClick: function(e) {
    var me = this;
    if (!me.readOnly && !me.disabled && !me.readOnlyPicker) {
      if (me.isExpanded) {
        me.collapse();
      } else {
        me.expand();
      }
    }
  },

  reset: function() {
    this.callParent();
    this.setValueOnData();
    this.hasDirtyValue = false;
  },

  beforeDestroy: function() {
    var me = this,
      picker = me.picker;
    me.callParent();
    Ext.un('resize', me.alignPicker, me);
    Ext.destroy(me.keyNav, picker);
    if (picker) {
      me.picker = picker.pickerField = null;
    }
  },

  privates: {
    onGlobalScroll: function(scroller) {
      // Collapse if the scroll is anywhere but inside the picker
      if (!this.picker.owns(scroller.getElement())) {
        this.collapse();
      }
    }
  }
});
