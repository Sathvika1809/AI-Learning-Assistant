import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, BookOpen, BrainCircuit, Clock } from 'lucide-react';
import moment from 'moment';

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return 'N/A';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="
        group relative
        bg-white/70 backdrop-blur-xl
        border border-white/70
        rounded-xl
        p-5
        hover:border-sky-200/80
        hover:shadow-xl hover:shadow-blue-100/60
        transition-all duration-300
        flex flex-col justify-between
        cursor-pointer
        hover:translate-y-1
      "
      onClick={handleNavigate}
    >
      {/* Header Section */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">

          {/* Document Icon */}
          <div
            className="
              shrink-0
              w-12 h-12
              bg-gradient-to-br from-sky-300 to-blue-500
              rounded-xl
              flex items-center justify-center
              shadow-lg shadow-blue-400/20
              group-hover:scale-110
              transition-transform duration-300
            "
          >
            <FileText
              className="w-6 h-6 text-white"
              strokeWidth={2}
            />
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="
              opacity-0
              group-hover:opacity-100
              w-8 h-8
              flex items-center justify-center
              text-slate-400
              hover:text-red-500
              hover:bg-red-50
              rounded-lg
              transition-all duration-200
            "
          >
            <Trash2
              className="w-4 h-4"
              strokeWidth={2}
            />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        className="text-base font-semibold text-slate-900 truncate mb-2"
        title={document.title}
      >
        {document.title}
      </h3>

      {/* Document Info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        {document.fileSize !== undefined && (
          <span className="font-medium">
            {formatFileSize(document.fileSize)}
          </span>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Flashcards */}
        {document.flashcardCount !== undefined && (
          <div
            className="
              flex items-center gap-1.5
              px-2.5 py-1.5
              bg-sky-50/80
              rounded-lg
            "
          >
            <BookOpen
              className="w-3.5 h-3.5 text-sky-600"
              strokeWidth={2}
            />

            <span className="text-xs font-semibold text-sky-700">
              {document.flashcardCount} Flashcards
            </span>
          </div>
        )}

        {/* Quizzes */}
        {document.quizCount !== undefined && (
          <div
            className="
              flex items-center gap-1.5
              px-2.5 py-1.5
              bg-blue-50/80
              rounded-lg
            "
          >
            <BrainCircuit
              className="w-3.5 h-3.5 text-blue-600"
              strokeWidth={2}
            />

            <span className="text-xs font-semibold text-blue-700">
              {document.quizCount} Quizzes
            </span>
          </div>
        )}
      </div>

      {/* Footer Section */}
      <div className="mt-5 pt-4 border-t border-slate-100/80">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Clock
            className="w-3.5 h-3.5"
            strokeWidth={2}
          />

          <span>
            Uploaded {moment(document.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Hover Indicator */}
      <div
        className="
          absolute inset-0
          rounded-2xl
          bg-gradient-to-br
          from-sky-400/0 to-blue-500/0
          group-hover:from-sky-400/5
          group-hover:to-blue-500/5
          transition-all duration-300
          pointer-events-none
        "
      />
    </div>
  );
};

export default DocumentCard;