export interface PlaceModel {
    id?: string;
    ticket?: string;
    address?: string;
    comment?: string;
    latitude?: number;
    longitude?: number;
    placeName?: string;
    visitTime?: string;
    description?: string;
    likeNumber?: string;
    placeLabel?: string;
    viewNumber?: string;
    phoneNumber?: string;
    openCloseHour?: string;
    placeImageFolder?: string;
}

export type PlaceModelJson = {
    id?: string;
    ticket?: string;
    address?: string;
    comment?: string;
    latitude?: number;
    longitude?: number;
    place_name?: string;
    visit_time?: string;
    description?: string;
    like_number?: string;
    place_label?: string;
    view_number?: string;
    phone_number?: string;
    open_close_hour?: string;
    place_image_folder?: string;
};

export function fromJson(json: PlaceModelJson): PlaceModel {
    return {
        id: json.id,
        ticket: json.ticket,
        address: json.address,
        comment: json.comment,
        latitude: json.latitude,
        longitude: json.longitude,
        placeName: json.place_name,
        visitTime: json.visit_time,
        description: json.description,
        likeNumber: json.like_number,
        placeLabel: json.place_label,
        viewNumber: json.view_number,
        phoneNumber: json.phone_number,
        openCloseHour: json.open_close_hour,
        placeImageFolder: json.place_image_folder,
    };
}

export function toJson(model: PlaceModel): PlaceModelJson {
    return {
        id: model.id,
        ticket: model.ticket,
        address: model.address,
        comment: model.comment,
        latitude: model.latitude,
        longitude: model.longitude,
        place_name: model.placeName,
        visit_time: model.visitTime,
        description: model.description,
        like_number: model.likeNumber,
        place_label: model.placeLabel,
        view_number: model.viewNumber,
        phone_number: model.phoneNumber,
        open_close_hour: model.openCloseHour,
        place_image_folder: model.placeImageFolder,
    };
}
