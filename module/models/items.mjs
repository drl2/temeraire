class DevotionItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };

        return {
            rank: new fields.NumberField({ requiredInteger, min: 1, max: 5 }),
            checked: new fields.NumberField({ requiredInteger, min: 0, max: 5 }),
            denied: new fields.BooleanField({ required: true, nullable: false, default: false })
        }
    }
}


export class DutyItemModel extends DevotionItemModel {
    static defineSchema() {
        const schema = super.defineSchema();
        return schema;
    }
}


export class DesireItemModel extends DevotionItemModel {
    static defineSchema() {
        const schema = super.defineSchema();
        return schema;
    }
}

export class ResourceItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        
        return {
            uses: new fields.NumberField({ requiredInteger, min: 1, max: 5 }),
        }
    }
}


export class EquipmentItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        
        return {
        }
    }
}


export class AreaOfExpertiseItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        
        return {
            level: new fields.NumberField({ requiredInteger, min: 1, max: 3, initial: 1 })
        }
    }
}

export class ConnectionItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        
        return {
            description: new fields.StringField({ required: true, nullable: false, initial: "" })
        }
    }
}

export class BondItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        
        return {
            description: new fields.StringField({ required: true, nullable: false, initial: "" })
        }
    }
}

export class TraitItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        
        return {
            description: new fields.StringField({ required: true, nullable: false, initial: "" })
        }
    }
}


export class AbilityItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        
        return {
            description: new fields.StringField({ required: true, nullable: false, initial: "" })
        }
    }
}


export class CrewItemModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = { required: true, nullable: false, integer: true };
        
        return {
            rating: new fields.NumberField({ requiredInteger, min: 0, max: 5 }),
            description: new fields.StringField({ required: true, nullable: false, initial: "" })
        }
    }
}
