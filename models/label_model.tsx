export interface LabelModel {
    id?: string;
    createdAt?: string;
    labelName?: string;
    isActive?: boolean;
}

export type LabelModelJson = {
    id?: string;
    created_at?: string;
    label_name?: string;
    is_active?: boolean;
};

export function fromJson(json: LabelModelJson): LabelModel {
    return {
        id: json.id,
        createdAt: json.created_at,
        labelName: json.label_name,
        isActive: json.is_active,
    };
}

export function toJson(model: LabelModel): LabelModelJson {
    return {
        id: model.id,
        created_at: model.createdAt,
        label_name: model.labelName,
        is_active: model.isActive,
    };
}
