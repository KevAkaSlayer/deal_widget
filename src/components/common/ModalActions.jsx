export default function ModalActions({
  onCancel,
  cancelDisabled = false,
  submitDisabled = false,
  submitLabel = "Save",
}) {
  return (
    <div className="mt-2 flex justify-end gap-2">
      <button
        type="button"
        className="btn btn-outline"
        onClick={onCancel}
        disabled={cancelDisabled}
      >
        Cancel
      </button>
      <button
        type="submit"
        className="btn btn-neutral"
        disabled={submitDisabled}
      >
        {submitLabel}
      </button>
    </div>
  );
}
