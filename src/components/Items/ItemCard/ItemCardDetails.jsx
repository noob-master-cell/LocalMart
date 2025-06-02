// project/src/components/Items/ItemCard/ItemCardDetails.jsx
import React from "react";
import WhatsAppIcon from "../../Icons/WhatsAppIcon";

const CARD_CONTENT_HEIGHT = "h-[220px]"; // Or adjust as needed after button changes

const ItemCardDetails = ({
  item,
  isLostAndFound,
  formattedPrice,
  formattedTime,
  posterName,
  hideContactButton,
  onContactClick,
  onOpenDetailModal,
  actionElements, // New prop for custom action buttons
}) => {
  return (
    <div
      className={`p-4 flex-grow flex flex-col ${CARD_CONTENT_HEIGHT} overflow-hidden`}
    >
      <div className="flex-grow overflow-hidden">
        <h3
          className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2"
          title={item.name}
        >
          {item.name || "Untitled Item"}
        </h3>
        <p className="text-gray-600 mb-3 text-sm leading-relaxed line-clamp-3">
          {item.description || "No description available."}
        </p>
        {formattedPrice && (
          <p className="text-xl font-bold text-indigo-600 mb-2">
            {formattedPrice}
          </p>
        )}
        {isLostAndFound && (
          <div className="mb-2 space-y-1">
            {item.lastSeenLocation && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Last seen:</span>{" "}
                {item.lastSeenLocation}
              </p>
            )}
            {item.dateFound?.seconds && (
              <p className="text-sm text-gray-500">
                <span className="font-medium">Date:</span>{" "}
                {new Date(item.dateFound.seconds * 1000).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
        <div className="space-y-1 mb-4">
          <p className="text-xs text-gray-400">
            <span className="font-medium">Category:</span>{" "}
            {item.category || "N/A"}
          </p>
          <p className="text-xs text-gray-400 truncate" title={posterName}>
            <span className="font-medium">By:</span> {posterName}
          </p>
          {formattedTime && (
            <p className="text-xs text-gray-400">
              <span className="font-medium">Posted:</span> {formattedTime}
            </p>
          )}
        </div>
      </div>
      <div className="mt-auto pt-2">
        {actionElements ? (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {actionElements}
          </div>
        ) : (
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            {!hideContactButton && (
              <button
                onClick={onContactClick}
                disabled={!item.whatsappNumber}
                className={`flex-1 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  item.whatsappNumber
                    ? isLostAndFound
                      ? "bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
                      : "bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <WhatsAppIcon />
                <span>{isLostAndFound ? "Contact" : "Contact Seller"}</span>
              </button>
            )}
            <button
              onClick={onOpenDetailModal}
              className={`flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 ${
                hideContactButton ? "w-full" : ""
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>View Details</span>
            </button>
          </div>
        )}
        {!actionElements && !hideContactButton && !item.whatsappNumber && (
          <p className="text-xs text-red-500 mt-2 text-center">
            WhatsApp contact required by poster
          </p>
        )}
      </div>
    </div>
  );
};
export default React.memo(ItemCardDetails);
