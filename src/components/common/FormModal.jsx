export default function FormModal({ title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 px-4">
      <div className="w-full max-w-2xl rounded-xl border bg-black p-4">
        <h3 className="mb-4 text-left text-lg font-semibold">{title}</h3>
        {children}
      </div>
    </div>
  );
}
