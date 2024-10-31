sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, formatter, JSONModel, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("acn.btpui5treinamento.controller.Worklist", {

            formatter: formatter,

            onInit: function () {
                this.setModel(new JSONModel({
                    nome: "",
                    sexo: "",
                    createdBy: ""
                }), "oFilterModel")

                this.setModel(new JSONModel({
                    CurrentDate: new Date()
                }), "oDateControl")
            },

            stringParaData: function (dataString) {
                const aCuts = dataString.split("/")
                const data = new Date(aCuts[2], aCuts[1] - 1, aCuts[0])

                return data
            },

            convertToEdmDateTime: function (Date) {
                var iso = Date.toISOString()
                var trim = `${iso.slice(0, -5)}z`

                return trim
            },

            onSearch: function (oEvent) {
                debugger
                var oSmart = this.getView().byId("smtUser")
                oSmart.rebindTable(true)
            },

            onRebindTable: function (oEvent) {
                debugger
                //Smart Table
                var oBindinParams = oEvent.getParameter("bindingParams")
                //Parametros de tela
                var oFilterModel = this.getModel("oFilterModel").getData()

                if (oBindinParams) {
                    var aFields = Object.getOwnPropertyNames(oFilterModel)
                    if (aFields.length > 0) {
                        aFields.forEach(campo => {
                            if (oFilterModel[campo]) {
                                if (campo === 'nome') {
                                    oBindinParams.filters.push(new Filter(`${campo}`, FilterOperator.Contains, oFilterModel[campo]))
                                } else {
                                    if (campo === 'sexo') {
                                        oBindinParams.filters.push(new Filter(`${campo}`, FilterOperator.EQ, parseInt(oFilterModel[campo])))
                                    } else {
                                        oBindinParams.filters.push(new Filter(`${campo}`, FilterOperator.EQ, oFilterModel[campo]))
                                    }
                                }
                            }
                        })
                    }

                    var oDtrCreate = this.getView().byId("dtrCreate").getValue()
                    if (oDtrCreate) {
                        var aDates = oDtrCreate.split('-')
                        aDates[0] = aDates[0].replace(/[" "]/g, "")
                        aDates[1] = aDates[1].replace(/[" "]/g, "")
                        if (aDates[0] === aDates[1]) {
                            oBindinParams.filters.push(new Filter("createdAt", FilterOperator.EQ, this.convertToEdmDateTime(this.stringParaData(aDates[0]))))
                        } else {
                            oBindinParams.filters.push(new Filter("createdAt", FilterOperator.BT, this.convertToEdmDateTime(this.stringParaData(aDates[0])), this.convertToEdmDateTime(this.stringParaData(aDates[1]))))
                        }
                    }
                }
            },
            onCallNextScreen: function(oEvent){
                debugger
                var sCPF = oEvent.getSource().getBindingContext().getObject().cpf

                this.getRouter().navTo("RouterObject", {
                    CPF: sCPF
                })
            },

            openDialog: function(sFragmentName){
                if(this._oDialog){
                    this.closeDialog()
                }
                var sPath = `acn.btpui5treinamento.fragment.${sFragmentName}`
                this._oDialog = sap.ui.xmlfragment(this.getView().getId(), sPath, this)
                this.getView().addDependent(this._oDialog)
                this._oDialog.setEscapeHandler( function () {
                    this.closeDialog()
                }.bind(this))
                this._oDialog.open()
            },

            closeDialog: function(){
                this._oDialog.destroy()
                this._oDialog= null
            },

            onCreateUser: function(){
                this.openDialog('user')
            }

        });
    });
