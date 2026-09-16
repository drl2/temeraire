class PCBaseActorModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        const abilityScore = {requiredInteger, min: 0, max: 4};
        const skillLevel = {requiredInteger, min: 0, max: 3};
        const dangerLevel = {requiredInteger, min: 0, max: 8};
        const dangerBoxes = {requiredInteger, min: 2, max: 4};
        const dangerChecked = {requiredInteger, min: 0, max: 4};
        const burdenScore = {requiredInteger, min: 0, max: 5};

        return {
            bio: new fields.SchemaField({
                look: new fields.StringField(),
                pronouns: new fields.StringField(),
                servicerecord: new fields.StringField(),
                temperament: new fields.StringField(),
                distinction: new fields.StringField()
            }),
            attributes: new fields.SchemaField({
                body: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    agility: new fields.NumberField(skillLevel),
                    force: new fields.NumberField(skillLevel),
                    lethality: new fields.NumberField(skillLevel)
                }),
                cunning: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    attention: new fields.NumberField(skillLevel),
                    guile: new fields.NumberField(skillLevel),
                    intuition: new fields.NumberField(skillLevel)
                }),
                manners: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    performance: new fields.NumberField(skillLevel),
                    persuasion: new fields.NumberField(skillLevel),
                    propriety: new fields.NumberField(skillLevel)
                }),
                steel: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    coercion: new fields.NumberField(skillLevel),
                    direction: new fields.NumberField(skillLevel),
                    endurance: new fields.NumberField(skillLevel)
                })
            }),
            dangers: new fields.SchemaField({
                dishonor: new fields.SchemaField({
                    value: new fields.NumberField(dangerLevel),
                    boxes: new fields.NumberField(dangerBoxes),
                    checked: new fields.NumberField(dangerChecked)
                }),
                scandal: new fields.SchemaField({
                    value: new fields.NumberField(dangerLevel),
                    boxes: new fields.NumberField(dangerBoxes),
                    checked: new fields.NumberField(dangerChecked)
                }),
                stress: new fields.SchemaField({
                    value: new fields.NumberField(dangerLevel),
                    boxes: new fields.NumberField(dangerBoxes),
                    checked: new fields.NumberField(dangerChecked)
                }),
                wounds: new fields.SchemaField({
                    value: new fields.NumberField(dangerLevel),
                    boxes: new fields.NumberField(dangerBoxes),
                    checked: new fields.NumberField(dangerChecked)
                })
            }),
            burdens: new fields.SchemaField({
                duty: new fields.NumberField(burdenScore),
                desire: new fields.NumberField(burdenScore)
            })
        };
    }
}


export class HumanPCActorModel extends PCBaseActorModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.bio.position = new foundry.data.fields.StringField();
        schema.bio.nationality = new foundry.data.fields.StringField();
        schema.bio.station = new foundry.data.fields.StringField();

        return schema;
    }
}


export class DragonPCActorModel extends PCBaseActorModel {
    static defineSchema() {
        const schema = super.defineSchema();

        schema.bio.breed = new foundry.data.fields.StringField();
        schema.bio.age = new foundry.data.fields.StringField();
        schema.bio.education = new foundry.data.fields.StringField();
        schema.bio.weightclass = new foundry.data.fields.StringField();

        return schema;
    }
}


export class NPCActorModel extends foundry.abstract.TypeDataModel {

    static defineSchema() {
        const fields = foundry.data.fields;
        const requiredInteger = {required: true, nullable: false, integer: true};
        const abilityScore = {requiredInteger, min: 0, max: 4};

        return {
            look: new fields.StringField(),
            ambition: new fields.StringField(),
            attributes: new fields.SchemaField({
                body: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    descriptor: new fields.StringField()
                }),
                cunning: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    descriptor: new fields.StringField()
                }),
                manners: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    descriptor: new fields.StringField()
                }),
                steel: new fields.SchemaField({
                    value: new fields.NumberField(abilityScore),
                    descriptor: new fields.StringField()
                })
            }),
            resistance: new fields.NumberField({requiredInteger, min: 0})
        };
    }
}
