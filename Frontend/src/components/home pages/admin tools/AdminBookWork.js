import "../../../style/modal-window.css"
import {useNavigate} from "react-router-dom";
import {deleteBook} from "../../../api/adminBookApi";

export default function AdminEditorModal({ isOpen, onClose, book }) {
    const navigate = useNavigate();

    if (!isOpen || !book) return null;

    const handleEditBook = () => {

    }

    const handleDeleteBook = () => {
        deleteBook(book.isbn)
            .then(() => {
                onClose();
                window.location.reload();
            })
            .catch(err => console.error("Ошибка удаления книги:", err))
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-window" onClick={(e) => e.stopPropagation()}>
                <h2>{book.author}: "{book.title}"</h2>
                <button className="close-btn" onClick={onClose}> X </button>
                <div className="modal-buttons">
                    <button className="add-btn" onClick={handleEditBook}>
                        ✏ Изменить
                    </button>

                    <button className="add-btn"
                            onClick={() => navigate("/reader")}>
                        📖 Открыть
                    </button>

                    <button className="action-btn" onClick={handleDeleteBook}>
                        🗑 Удалить
                    </button>
                </div>
            </div>
        </div>
    );
}
