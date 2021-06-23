export function Badge({header, content}: {header: string, content: any}) {
  return (
    <p className="bg-indigo-200 font-medium px-3 py-1 rounded-full">
      {header}
        <span className="bg-pink-400 font-bold ml-2 px-3 rounded-full text-white">
          {content}
        </span>
    </p>
  )
}