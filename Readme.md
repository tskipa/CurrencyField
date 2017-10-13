# CurrencyField - Read Me

CurrencyField
=============

A currency Form Field for Sencha, ExtJS 5.x and ExtJS less than 6.2 <br/>

This widget is an extension of numberfield and has currency Picker. <br/>

---

Usage:

Define the field as normal <code>numberfield</code>, plus you can bind it to the store and choose
<code>displayField</code> & <code>valueField</code> as in combobox. <br/>
There is a prop <code>currencyValue</code> which holds the current value for currency. <br/>
<code>currencyValue</code> has a getter method and you can use it to do custom update of a loaded record.<br/>
Disabling field via <code>readOnly</code> prop will leave currency picker visible in read only format,
while <code>readOnlyPicker</code> will disable picker separately.

Fiddle: https://fiddle.sencha.com/#view/editor&fiddle/27mf

---
