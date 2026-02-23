type NoticeProps = {
  type: "success" | "error" | "warn" | "info"
  message: string
}

export const Notice = ({ type, message }: NoticeProps) => {
  const bgColor =
    type === "success"
      ? "bg-green-50"
      : type === "error"
        ? "bg-red-50"
        : type === "warn"
          ? "bg-yellow-50"
          : "bg-blue-50"
  const borderLeftColor =
    type === "success"
      ? "border-l-green-400"
      : type === "error"
        ? "border-l-red-400"
        : type === "warn"
          ? "border-l-yellow-400"
          : "border-l-blue-400"
  const textColor =
    type === "success"
      ? "text-green-800"
      : type === "error"
        ? "text-red-800"
        : type === "warn"
          ? "text-yellow-800"
          : "text-blue-800"

  return (
    <div
      role="alert"
      className={`rounded-md border-l-4 ${borderLeftColor} ${bgColor} p-2 text-sm ${textColor}`}
    >
      {message}
    </div>
  )
}
