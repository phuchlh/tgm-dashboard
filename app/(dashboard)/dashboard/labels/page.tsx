"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress } from "@mui/material";
import { supabase } from "@/lib/supabase";
import { LabelModel } from "@/models/label_model";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@heroicons/react/24/outline";
import { ToastContainer, toast } from "react-toastify";
import EditIcon from "@mui/icons-material/Edit";
import Switch from "@mui/material/Switch";

import "react-toastify/dist/ReactToastify.css";

const itemsPerPage = 10;

export default function LabelsPage() {
    const [labels, setLabels] = useState<LabelModel[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<LabelModel | null>(null);
    const [editLabelName, setEditLabelName] = useState("");
    const editInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchLabels();
    }, [currentPage]);

    const fetchLabels = async () => {
        setLoading(true);
        // Get total count
        const { count } = await supabase.from("labels").select("*", { count: "exact", head: true });
        setTotalCount(count || 0);
        // Fetch paginated data
        const { data, error } = await supabase
            .from("labels")
            .select("*")
            .order("id", { ascending: false })
            .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);
        if (error) {
            setError("Failed to fetch labels");
            toast.error("Không thể tải danh sách nhãn!");
        } else {
            // parse into LabelModel
            const parsedData = data?.map((label) => ({
                id: label.id,
                labelName: label.label_name,
                createdAt: new Date(label.created_at).toLocaleDateString("vi-VN"),
                isActive: label.is_active,
            })) as LabelModel[];
            setLabels(parsedData || []);
        }
        setLoading(false);
    };

    const handleAddLabel = async () => {
        if (!newLabel.trim()) return;
        setAdding(true);
        const { data, error } = await supabase
            .from("labels")
            .insert([{ label_name: newLabel }])
            .select();
        if (error) {
            setError("Failed to add label");
            toast.error("Không thể thêm nhãn mới!");
        } else if (data && data.length > 0) {
            setNewLabel("");
            setModalOpen(false);
            fetchLabels();
            toast.success("Thêm nhãn thành công!");
        }
        setAdding(false);
    };

    const handleToggleStatusLabel = async (labelId: string, isActive: boolean) => {
        if (!labelId) return;
        const { error } = await supabase.from("labels").update({ is_active: !isActive }).eq("id", labelId);
        if (error) {
            setError("Failed to update label status");
            toast.error("Không thể cập nhật trạng thái nhãn!");
        } else {
            fetchLabels();
            toast.success("Cập nhật trạng thái nhãn thành công!");
        }
    };

    const handleEditLabel = (label: LabelModel) => {
        setEditingLabel(label);
        setEditLabelName(label.labelName || "");
        setEditModalOpen(true);
        setTimeout(() => {
            editInputRef.current?.focus();
        }, 100);
    };

    const handleUpdateLabel = async () => {
        if (!editingLabel?.id || !editLabelName.trim()) return;
        const { error } = await supabase.from("labels").update({ label_name: editLabelName }).eq("id", editingLabel.id);
        if (error) {
            setError("Failed to update label");
            toast.error("Không thể cập nhật nhãn!");
        } else {
            setEditModalOpen(false);
            setEditingLabel(null);
            setEditLabelName("");
            fetchLabels();
            toast.success("Cập nhật nhãn thành công!");
        }
    };

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return (
        <div className="max-w-7xl mx-auto">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Nhãn du lịch</h1>
                    <p className="mt-2 text-sm text-gray-700">Danh sách các nhãn du lịch.</p>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <button onClick={() => setModalOpen(true)} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Thêm nhãn
                    </button>
                </div>
            </div>
            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-300">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            STT
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Tên nhãn
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Ngày tạo
                                        </th>
                                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                            Trạng thái
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white ">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8">
                                                <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 inline-block"></span>
                                            </td>
                                        </tr>
                                    ) : labels.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                                Không có nhãn nào.
                                            </td>
                                        </tr>
                                    ) : (
                                        labels.map(
                                            (label) => (
                                                // log
                                                console.log(label),
                                                (
                                                    <tr key={label.id}>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{(currentPage - 1) * itemsPerPage + labels.indexOf(label) + 1}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{label.labelName}</td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{label.createdAt}</td>
                                                        {/* add button to edit or delete */}

                                                        <td className="whitespace-nowrap text-sm text-gray-500">
                                                            <Switch checked={label.isActive} color="primary" onClick={() => handleToggleStatusLabel(label?.id ?? "", label?.isActive ?? true)} />
                                                        </td>

                                                        <td className="whitespace-nowrap text-sm text-gray-500">
                                                            <button className="text-indigo-600 hover:text-indigo-900" onClick={() => handleEditLabel(label)}>
                                                                <EditIcon fontSize="small" className="inline-block" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Hiển thị <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> trong tổng số <span className="font-medium">{totalCount}</span> nhãn
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="sr-only">Previous</span>
                                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                            <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span className="sr-only">Next</span>
                                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
            {/* Modal for add label */}
            <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
                <DialogTitle>Thêm mới nhãn du lịch</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Tên nhãn" fullWidth value={newLabel} onChange={(e) => setNewLabel(e.target.value)} disabled={adding} />
                    {error && <div className="text-red-500 mt-2">{error}</div>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)} disabled={adding}>
                        Hủy
                    </Button>
                    <Button onClick={handleAddLabel} variant="contained" color="primary" disabled={adding || !newLabel.trim()}>
                        {adding ? <CircularProgress size={24} /> : "Thêm"}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Edit Label Modal */}
            <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
                <DialogTitle>Chỉnh sửa nhãn</DialogTitle>
                <DialogContent>
                    <TextField inputRef={editInputRef} autoFocus margin="dense" label="Tên nhãn" fullWidth value={editLabelName} onChange={(e) => setEditLabelName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditModalOpen(false)}>Hủy</Button>
                    <Button onClick={handleUpdateLabel} variant="contained" color="primary" disabled={!editLabelName.trim()}>
                        Lưu
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
