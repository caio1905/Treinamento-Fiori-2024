sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox"
],
    function (BaseController, formatter, JSONModel, Filter, FilterOperator, MessageBox) {
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

                this.setModel(new JSONModel({
                    nome: "",
                    sexo: "",
                    dataNascimento: ""
                }), "oModelCreate")

                this.setModel(new JSONModel({
                    editable : true
                }), "oControl")
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
            onCallNextScreen: function (oEvent) {
                debugger
                var sCPF = oEvent.getSource().getBindingContext().getObject().cpf

                this.getRouter().navTo("RouterObject", {
                    CPF: sCPF
                })
            },

            openDialog: function (sFragmentName) {
                if (this._oDialog) {
                    this.closeDialog()
                }
                var sPath = `acn.btpui5treinamento.fragment.${sFragmentName}`
                this._oDialog = sap.ui.xmlfragment(this.getView().getId(), sPath, this)
                this.getView().addDependent(this._oDialog)
                this._oDialog.setEscapeHandler(function () {
                    this.closeDialog()
                }.bind(this))
                this._oDialog.open()
            },

            openDialogEdit: function (sFragmentName) {
                if (this._oDialog) {
                    this.closeDialog()
                }
                var sPath = `acn.btpui5treinamento.fragment.${sFragmentName}`
                this._oDialog = sap.ui.xmlfragment(this.getView().getId(), sPath, this)
                this.getView().addDependent(this._oDialog)
                this._oDialog.setEscapeHandler(function () {
                    this.closeDialog()
                }.bind(this))
            },

            closeDialog: function () {
                this._oDialog.destroy()
                this._oDialog = null
                this.getModel("oModelCreate").setData({})
            },

            onCreateUser: function () {
                this.getModel("oControl").setProperty("/editable", true)
                this.openDialog('user')
            },

            onCheckCPF: function (oEvent) {
                var oControl = oEvent.getParameters()
                var sValue = oControl.value
                sValue = sValue.replace(/\D/g, "")
                if (sValue.length === 3) {
                    sValue = sValue.replace(/(\d{3})/, "$1.")
                } else if (sValue.length === 6) {
                    sValue = sValue.replace(/(\d{3})(\d{3})/, "$1.$2.")
                } else if (sValue.length === 9) {
                    sValue = sValue.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3-")
                } else if (sValue.length === 11) {
                    sValue = sValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
                }
                oEvent.getSource().setValue(sValue)
            },

            validarCPF: function (cpf) {
                cpf = cpf.replace(/[^\d]+/g, ''); // Remove caracteres não numéricos

                if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
                    return false; // Verifica se o CPF tem 11 dígitos e não é uma sequência de números iguais
                }

                let soma = 0;
                let resto;

                // Validação do primeiro dígito verificador
                for (let i = 1; i <= 9; i++) {
                    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
                }

                resto = (soma * 10) % 11;
                if (resto === 10 || resto === 11) {
                    resto = 0;
                }
                if (resto !== parseInt(cpf.substring(9, 10))) {
                    return false;
                }

                soma = 0;

                // Validação do segundo dígito verificador
                for (let i = 1; i <= 10; i++) {
                    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
                }

                resto = (soma * 10) % 11;
                if (resto === 10 || resto === 11) {
                    resto = 0;
                }
                if (resto !== parseInt(cpf.substring(10, 11))) {
                    return false;
                }

                return true;
            },
            onSaveUser: function () {
                var oCheckModel = this.getModel("oControl").getData()
                if(!oCheckModel.editable){
                    this.updateUser()
                    return
                }
                var sCpf = this.getView().byId("cpfIp").getValue()
                var oSmart = this.getView().byId("smtUser")
                var oI18n = this.getModel("i18n").getResourceBundle()
                if (this._oDialog) {
                    this._oDialog.close()
                }
                if (!this.validarCPF(sCpf)) {
                    MessageBox.error(oI18n.getText("errOnCreate"), {
                        actions: [`${oI18n.getText('ok')}`],
                        onClose: sAction => {
                            if (sAction === oI18n.getText('ok')) {
                                this._oDialog.open()
                                return
                            }
                        }
                    })
                }

                var oCreate = {
                    cpf: sCpf.replace(/[^\d]+/g, ''),
                    nome: this.getModel("oModelCreate").getData().nome,
                    sexo: this.getModel("oModelCreate").getData().sexo,
                    dataNascimento: this.stringParaData(this.getView().byId("dtpCreate").getValue()),

                }

                var aFields = Object.getOwnPropertyNames(oCreate)
                var aValid = []
                if (aFields.length > 0) {
                    aFields.forEach(campo => {
                        if (oCreate[campo] === "" || oCreate[campo] === null || oCreate[campo] === undefined) {
                            aValid.push('X')
                        }
                    })
                }

                if (aValid.some(data => data === 'X')) {
                    MessageBox.error(oI18n.getText("errOnCreate2"), {
                        actions: [`${oI18n.getText('ok')}`],
                        onClose: sAction => {
                            if (sAction === oI18n.getText('ok')) {
                                this._oDialog.open()
                                return
                            }
                        }
                    })
                }
                this.closeDialog()
                this.getModel().create("/Usuarios", oCreate, {
                    success: oData => {
                        MessageBox.success(oI18n.getText("success"), {
                            actions: [`${oI18n.getText('ok')}`],
                            onClose: sAction => {
                                if (sAction === oI18n.getText('ok')) {
                                    oSmart.rebindTable(true)
                                    return
                                }
                            }
                        })
                    },
                    error: err => {
                        MessageBox.error(err)
                    }
                })
            },

            onEditUser: function(){
                this.getModel("oControl").setProperty("/editable", false)
                var iSelected = this.getView().byId("tbUser").getSelectedItems().length

                if(iSelected === 0){
                    MessageBox.error("Nenhum usuário selecionado")
                    return
                }else{
                    var sCPF = this.getView().byId("tbUser").getSelectedContexts()[0].getObject().cpf
                    if(sCPF){
                        this.openDialogEdit("user")
                        this.getModel().read(`/Usuarios(${sCPF})`, {
                            success: oUser => {
                                this.getView().byId("cpfIp").setValue(oUser.cpf)
                                this.getModel("oModelCreate").setProperty("/nome", oUser.nome)
                                this.getView().byId("dtpCreate").setValue(oUser.dataNascimento)
                                this.getModel("oModelCreate").setProperty("/sexo", oUser.sexo)
                                if(this._oDialog){
                                    this._oDialog.open()
                                }
                            },
                            error : err => {
                                MessageBox.error(err)
                            }
                        })
                    }
                }
            },

            updateUser: function(){
                var oI18n = this.getModel("i18n").getResourceBundle()
                var oSmart = this.getView().byId("smtUser")
                if (this._oDialog) {
                    this._oDialog.close()
                }
                var oUpdate = {
                    cpf: this.getView().byId("cpfIp").getValue().replace(/[^\d]+/g, ''),
                    nome: this.getModel("oModelCreate").getData().nome,
                    sexo: this.getModel("oModelCreate").getData().sexo,
                    dataNascimento: this.stringParaData(this.getView().byId("dtpCreate").getValue()),
                }

                var aFields = Object.getOwnPropertyNames(oUpdate)
                var aValid = []
                if (aFields.length > 0) {
                    aFields.forEach(campo => {
                        if (oUpdate[campo] === "" || oUpdate[campo] === null || oUpdate[campo] === undefined) {
                            aValid.push('X')
                        }
                    })
                }

                if (aValid.some(data => data === 'X')) {
                    MessageBox.error(oI18n.getText("errOnUpdate"), {
                        actions: [`${oI18n.getText('ok')}`],
                        onClose: sAction => {
                            if (sAction === oI18n.getText('ok')) {
                                this._oDialog.open()
                                return
                            }
                        }
                    })
                }
                this.closeDialog()
                this.getModel().update(`/Usuarios(${oUpdate.cpf})`, oUpdate, {
                    success: oUser => {
                        MessageBox.success(oI18n.getText("update"), {
                            actions: [`${oI18n.getText('ok')}`],
                            onClose: sAction => {
                                if (sAction === oI18n.getText('ok')) {
                                    oSmart.rebindTable(true)
                                    return
                                }
                            }
                        })
                    },
                    error : err => {

                    }
                })
            },
            handleSubmitChanges: function(oOptions){
                debugger
                var oModel = this.getModel()

                oModel.submitChanges({
                    groupId: oOptions.groupId,
                    success: data => {
                        if(!data.__batchResponses){
                            oOptions.error()
                            return
                        }

                        var isError = data.__batchResponses.some(line => {
                            if(line.response){
                                return line.response.statusCode[0] !== "2"
                            }
                            if(line.__changeResponses){
                                return line.__changeResponses.some( item => {
                                    return item.statusCode[0] !== "2"
                                })
                            }
                        })

                        if(isError){
                            oOptions.error()
                        }else{
                            oOptions.success()
                        }
                    },
                    error: err => {
                        oOptions.error()
                    }
                })
            },

            onDeleteUser : function(){
                debugger
                var oModel = this.getModel()
                var sGroup = jQuery.sap.uid()
                oModel.setDeferredGroups([sGroup])
                var iSelected = this.getView().byId("tbUser").getSelectedItems().length
                if(iSelected === 0){
                    MessageBox.error("Nenhum usuário selecionado")
                    return
                }
                var sCPF = this.getView().byId("tbUser").getSelectedContexts()[0].getObject().cpf

                var fnSubmitDelete = () => {
                    this.handleSubmitChanges({
                        grouId: sGroup,
                        success : () => {
                            MessageBox.success("Deu bom!")
                        },
                        error : () => {
                            MessageBox.error("Deu Ruim!")
                        }
                    })
                }

                this.getModel().read(`/Usuarios(${sCPF})`, {
                    urlParameters: {
                        "$expand": "veiculos"
                    },
                    success: oData => {
                        debugger
                        if(oData){
                            oModel.remove(`/Usuarios(${oData.cpf})`,{
                                groupId: sGroup
                            })
                            if(oData.veiculos.results.length > 0){
                                oData.veiculos.results.forEach( item => {
                                    oModel.remove(`/Veiculos(${item.id},${item.cpf})`, {
                                        groupId: sGroup
                                    })
                                })
                            }
                            
                            fnSubmitDelete()
                        }
                    },
                    error: err => {
                        debugger
                        console.log(err)
                    }
                })
            }

        });
    });
