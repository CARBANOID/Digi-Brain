export const CardLoader = ({CardDefaultStyles} : {CardDefaultStyles? : string}) =>{
    return (
        <div className={`p-6 max-w-85 ${CardDefaultStyles ?? ""} animate-pulse`}>
            <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                <div className="h-6 bg-gray-300 rounded w-6"></div>
            </div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
                <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
            </div>
        </div>
    )
}

export const FileFolderLoader = () => {
    return (
        <div className="animate-pulse">
            <div className="min-w-55 sm:min-w-40 md:min-w-50 w-max p-1 border-2 border-gray-300 rounded-sm mt-1 bg-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center pr-2">
                        <div className="pr-1">
                            <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        </div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const FileSystemLoader = () => {
    return (
        <div className="items-center p-3 sm:p-2 md:p-4">
            <div className="scrollbar-hide scroll overflow-y-scroll overflow-hidden h-130 w-70 sm:w-50 md:w-60 border-2 border-gray-600 rounded-lg p-2">
                {[1,2,3,4,5,6,7].map((item) => (
                    <div key={item} className="mb-2 animate-pulse">
                        <div className="flex items-center p-2 bg-gray-200 rounded-md">
                            <div className="w-5 h-5 bg-gray-300 rounded mr-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-32"></div>
                        </div>
                    </div>
                ))}

                <div className="mt-2 animate-pulse">
                    <div className="flex rounded-md items-center">
                        <div className="p-1 rounded-md border-1 bg-gray-300 w-8 h-8"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const QueryLoader = () => {
    return (
        <div className="animate-pulse">
            <div className="bg-gray-200 rounded-md px-3 py-2 w-70 sm:w-65 md:w-78 lg:w-95 xl:w-150">
                <div className="flex items-start justify-between">
                    <div className="w-full">
                        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
                    </div>
                    <div className="w-5 h-5 bg-gray-300 rounded ml-2"></div>
                </div>
            </div>
            <div className="pb-1"></div>
        </div>
    );
};