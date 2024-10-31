sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    function (BaseController, formatter, JSONModel, Filter, FilterOperator) {
        "use strict";

        return BaseController.extend("acn.btpui5treinamento.controller.Object", {

            formatter: formatter,

            onInit: function () {
                debugger
                this.setModel(new JSONModel({}), "objectModel")
                this.setModel(new JSONModel({veiculos : []}), "veiculosModel")
                this.getRouter().getRoute("RouterObject").attachMatched(this._onObjectMatched, this)
            },

            _onObjectMatched: function(oEvent){
                debugger
                var sCPF = oEvent.getParameter("arguments").CPF

                this.getModel().read(`/Usuarios(${sCPF})`, {
                    urlParameters: {
                        "$expand": "veiculos"
                    },
                    success: oData => {
                        debugger
                        this.getModel("objectModel").setData(oData)
                        this.getModel("veiculosModel").setProperty("/veiculos", oData.veiculos.results)
                    },
                    error: err => {
                        debugger
                        console.log(err)
                    }
                })

            }
        });
    });
