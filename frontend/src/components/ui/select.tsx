export default function Select({ label, options, ...props }: any) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <select
        className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-colors appearance-none cursor-pointer"
        {...props}
      >
        {options.map((option: any) => (
          <option key={option.value} value={option.value} className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
