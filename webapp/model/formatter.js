sap.ui.define([

], function(){
    return{
        checkCpf: function(sValue){
            if(!sValue){
                return ""
            }
            sValue = sValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
            return sValue
        },

        getIcon: function(sValue){
            if(!sValue){
                return ""
            }

            if(sValue === 'system'){
                return 'sap-icon://it-system'
            }else{
                return 'sap-icon://customer'
            }
        },

        getState: function(sValue){
            if(!sValue){
                return ""
            }

            if(sValue === 'system'){
                return 'Success'
            }else{
                return 'Error'
            }
        },

        getInfo: function(sValue){
            if(!sValue){
                return ""
            }
            var oI18n = this.getModel('i18n').getResourceBundle()

            if(sValue === 'system'){
                return `${oI18n.getText("infoCreate1")}`
            }else{
                return `${oI18n.getText("infoCreate2")}`
            }
        },

        getSexo: function(sValue){
            if(!sValue){
                return ""
            }
            var oI18n = this.getModel('i18n').getResourceBundle()

            if(sValue === 1){
                return `${oI18n.getText("Masc")}`
            }else if( sValue === 2){
                return `${oI18n.getText("Fem")}`
            }else{
                return `${oI18n.getText("Other")}`
            }
        },

        getIconS: function(sValue){
            if(!sValue){
                return ""
            }

            if(sValue === 1){
                return 'sap-icon://male'
            }else if(sValue === 2){
                return 'sap-icon://gender-male-and-female'
            }else{
                return 'sap-icon://message-error'
            }
        },

        getStateS: function(sValue){
            if(!sValue){
                return ""
            }

            if(sValue === 1){
                return 'Success'
            }else if(sValue === 2){
                return 'Error'
            }else{
                return 'Warning'
            }
        },
    }
})