"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDropzone } from "react-dropzone";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

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

type PlaceFormData = z.infer<typeof placeSchema>;

export default function NewPlacePage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [newLabel, setNewLabel] = useState("");
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);
    const router = useRouter();
    const supabase = createClientComponentClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<PlaceFormData>({
        resolver: zodResolver(placeSchema),
    });

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

            // Save place data to Supabase
            const { error: placeError } = await supabase.from("places").insert([
                {
                    ...data,
                    images: imageUrls,
                },
            ]);

            if (placeError) throw placeError;

            router.push("/dashboard");
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
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Add New Place</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Required Fields */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Place Name *</label>
                        <input type="text" {...register("place_name")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.place_name && <p className="mt-1 text-sm text-red-600">{errors.place_name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                        <input type="tel" {...register("phone_number")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Visit Time *</label>
                        <input type="text" {...register("visit_time")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.visit_time && <p className="mt-1 text-sm text-red-600">{errors.visit_time.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Open/Close Hours *</label>
                        <input type="text" {...register("open_close_hour")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.open_close_hour && <p className="mt-1 text-sm text-red-600">{errors.open_close_hour.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address *</label>
                        <input type="text" {...register("address")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description *</label>
                        <textarea {...register("description")} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Latitude *</label>
                        <input type="number" step="any" {...register("latitude", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.latitude && <p className="mt-1 text-sm text-red-600">{errors.latitude.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Longitude *</label>
                        <input type="number" step="any" {...register("longitude", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.longitude && <p className="mt-1 text-sm text-red-600">{errors.longitude.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price From</label>
                        <input type="number" {...register("price_from", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price To</label>
                        <input type="number" {...register("price_to", { valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ticket</label>
                        <input type="text" {...register("ticket")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image Folder Name *</label>
                        <input type="text" {...register("place_image_folder")} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        {errors.place_image_folder && <p className="mt-1 text-sm text-red-600">{errors.place_image_folder.message}</p>}
                    </div>
                </div>

                {/* Labels Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Labels *</label>
                    <div className="mt-1 flex gap-2">
                        <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Add new label" className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        <button type="button" onClick={addNewLabel} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Add Label
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
                    <label className="block text-sm font-medium text-gray-700">Upload Images</label>
                    <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            <input {...getInputProps()} />
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>Upload files</span>
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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

                <div className="flex justify-end">
                    <button type="submit" disabled={isSubmitting} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                        {isSubmitting ? "Saving..." : "Save Place"}
                    </button>
                </div>
            </form>
        </div>
    );
}
