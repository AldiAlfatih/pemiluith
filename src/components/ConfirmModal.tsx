import { X, AlertTriangle } from "lucide-react"

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
              <AlertTriangle size={32} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 text-center mb-2">{title}</h3>
          <p className="text-slate-500 text-center text-sm mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button 
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
