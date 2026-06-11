export default function Button({ children, variant = 'primary', ...props }: any) {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow',
  }

  return (
    <button className={`${baseClasses} ${variants[variant as keyof typeof variants]}`} {...props}>
      {children}
    </button>
  )
}
