"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { PlaceModel } from "@/models/place_model";

const placeSchema = z.object({
    place_name: z.string().min(1, "Place name is required"),
    place_label: z.array(z.string()).min(1, "At least one label is required"),
    phone_number: z.string().min(1, "Phone number is required"),
    visit_time: z.string().min(1, "Visit time is required"),
    open_close_hour: z.string().min(1, "Open/close hours are required"),
    address: z.string().min(1, "Address is required"),
    description: z.string().min(1, "Description is required"),
    like_number: z.number().optional(),
    comment: z.string().optional(),
    view_number: z.number().optional(),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    place_image_folder: z.string().min(1, "Image folder name is required"),
    price_to: z.number().optional(),
    price_from: z.number().optional(),
    ticket: z.string().optional(),
});

export type PlaceFormData = z.infer<typeof placeSchema>;

export default function PlaceFormModal({ place, onClose, onSaved }: { place: PlaceModel | null; onClose: () => void; onSaved: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);
    const supabase = createClientComponentClient();

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
    } = useForm<PlaceFormData>({
        resolver: zodResolver(placeSchema),
        defaultValues: place
            ? {
                  ...place,
                  place_label: Array.isArray(place.placeLabel) ? place.placeLabel : typeof place.placeLabel === "string" ? place.placeLabel.split(",") : [],
              }
            : {},
    });

    useEffect(() => {
        if (place) {
            // Set form values for edit
            Object.entries(place).forEach(([key, value]) => {
                if (key === "place_label") {
                    setValue("place_label", Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : []);
                } else if (key in getValues()) {
                    setValue(key as keyof PlaceFormData, value as string);
                }
            });
        }
    }, [place, setValue, getValues]);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "image/*": [".jpeg", ".jpg", ".png", ".gif"],
        },
        onDrop: (acceptedFiles) => {
            setUploadedFiles((prev) => [...prev, ...acceptedFiles]);
        },
    });

    const onSubmit = async (data: PlaceFormData) => {
        setIsSubmitting(true);
        try {
            // Upload images to Supabase Storage
            const imageFolder = data.place_image_folder;
            const imageUrls = await Promise.all(
                uploadedFiles.map(async (file) => {
                    const fileExt = file.name.split(".").pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${imageFolder}/${fileName}`;

                    const { error: uploadError } = await supabase.storage.from("places").upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const {
                        data: { publicUrl },
                    } = supabase.storage.from("places").getPublicUrl(filePath);

                    return publicUrl;
                })
            );

            let result;
            if (place) {
                // Edit mode
                result = await supabase
                    .from("place_destination")
                    .update({
                        ...data,
                        images: imageUrls,
                    })
                    .eq("id", place.id);
            } else {
                // New mode
                result = await supabase.from("place_destination").insert([
                    {
                        ...data,
                        images: imageUrls,
                    },
                ]);
            }

            if (result.error) throw result.error;
            onSaved();
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const addNewLabel = async () => {
        if (!newLabel.trim()) return;
        try {
            const { error } = await supabase.from("labels").insert([{ name: newLabel }]);
            if (error) throw error;
            setAvailableLabels((prev) => [...prev, newLabel]);
            setNewLabel("");
        } catch (error) {
            console.error("Error adding label:", error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6 dark:text-gray-400">{place ? "Sửa" : "Thêm mới"}</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Required Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Tên địa điểm *</label>
                        <input type="text" {...register("place_name")} className="mt-1.5 block w-full h-11 rounded-md shadow-sm sm:text-sm  p-1 focus:outline-gray-300 focus:outline-1 " />
                        {errors.place_name && <p className="mt-1 text-sm text-red-600">{errors.place_name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Số điện thoại *</label>
                        <input type="tel" {...register("phone_number")} className="mt-1.5 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Thời gian tham quan *</label>
                        <input type="text" {...register("visit_time")} className="mt-1.5 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.visit_time && <p className="mt-1 text-sm text-red-600">{errors.visit_time.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Giờ đóng/mở cửa *</label>
                        <input type="text" {...register("open_close_hour")} className="mt-1.5 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.open_close_hour && <p className="mt-1 text-sm text-red-600">{errors.open_close_hour.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">Địa chỉ *</label>
                        <input type="text" {...register("address")} className="mt-1.5 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-400">Mô tả *</label>
                        <textarea {...register("description")} rows={3} className="mt-1.5 block w-full  h-44 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Kinh độ *</label>
                        <input type="number" step="any" {...register("latitude", { valueAsNumber: true })} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Vĩ độ *</label>
                        <input type="number" step="any" {...register("longitude", { valueAsNumber: true })} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Giá từ</label>
                        <input type="number" {...register("price_from", { valueAsNumber: true })} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Đến</label>
                        <input type="number" {...register("price_to", { valueAsNumber: true })} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Vé</label>
                        <input type="text" {...register("ticket")} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Tên thư mục ảnh *</label>
                        <input type="text" {...register("place_image_folder")} className="mt-1 block w-full  h-11 rounded-md border-gray-300 shadow-sm focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm" />
                        {errors.place_image_folder && <p className="mt-1 text-sm text-red-600">{errors.place_image_folder.message}</p>}
                    </div>
                </div>
                {/* Labels Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Loại địa điểm *</label>
                    <div className="mt-1 flex gap-2">
                        <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add new label" className="block w-full rounded-md focus:outline-gray-300 focus:outline-1 p-1    sm:text-sm  h-11 " />
                        <button type="button" onClick={addNewLabel} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Thêm
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {availableLabels.map((label) => (
                            <label key={label} className="inline-flex items-center">
                                <input type="checkbox" value={label} {...register("place_label")} className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                <span className="ml-2 text-sm text-gray-700">{label}</span>
                            </label>
                        ))}
                    </div>
                    {errors.place_label && <p className="mt-1 text-sm text-red-600">{errors.place_label.message}</p>}
                </div>
                {/* Image Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Ảnh</label>
                    <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <input {...getInputProps()} />
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Tải ảnh lên</span>
                                </label>
                                <p className="pl-1">hoặc kéo thả vào đây</p>
                            </div>
                            <p className="text-xs text-gray-500">chỉ chấp nhận các file PNG, JPG, GIF và dưới 10MB</p>
                        </div>
                    </div>
                    {uploadedFiles.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            {uploadedFiles.map((file, index) => (
                                <div key={index} className="relative">
                                    <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="h-24 w-24 object-cover rounded-lg" />
                                    <button type="button" onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== index))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isSubmitting ? (place ? "Saving..." : "Creating...") : place ? "Save Changes" : "Create Place"}
                    </button>
                </div>
            </form>
        </div>
    );
}
