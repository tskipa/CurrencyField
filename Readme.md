# CurrencyField - Read Me

=============

A currency Form Field for Sencha, ExtJS 5.x and 6.x <br/>

This widget is an extension of numberfield and has currency Picker. <br/>

---

Usage:

Define the field as normal <code>numberfield</code>, plus you can bind it to the store and choose
<code>displayField</code> & <code>valueField</code> as in combobox. <br/>

Fiddle: https://fiddle.sencha.com/#view/editor&fiddle/27mf

---

## configs:

<code>currencyValue</code> : <b>String</b> Holds the current value for currency. <br/>
<code>displayField</code> : <b>String</b> The underlying data field name to bind to CurrencyField. <br/>
See also valueField. Defaults to: 'text'<br/>
<code>readOnly</code> : <b>Boolean</b> This config is inherited from the parent. <br/>
Disabling field via this prop will leave currency picker visible in read only format. <br/>
<code>readOnlyPicker</code> : <b>Boolean</b> This config will disable picker only and leave numberfield active. <br/>
<code>valueField</code> : <b>String</b> The underlying data value name to bind to this CurrencyField. <br/>
Defaults to match the value of the displayField config.

---

## methods:

<code>getCurrencyValue()</code> : A getter method for <code>currencyValue</code> to do custom update of a loaded record. <br/>
