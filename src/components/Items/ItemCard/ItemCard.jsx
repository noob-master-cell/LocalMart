// project/src/components/Items/ItemCard/ItemCard.jsx
import React, { useState, useCallback, useMemo, memo } from "react";
import ItemCardHeader from "./ItemCardHeader.jsx";
import ItemCardDetails from "./ItemCardDetails.jsx";
import ImageViewer from "../../Media/ImageViewer/ImageViewer.jsx";
import ItemDetailModal from "../ItemDetailModal/ItemDetailModal.jsx";
import {
  generateWhatsAppURL,
  formatPrice,
  formatRelativeTime,
} from "../../../utils/helpers.js";

const ItemCard = memo(
  ({
    item,
    onContact,
    isLostAndFound = false,
    showMessage,
    className = "",
    hideContactButton = false,
    user,
    statusIndicator, // New prop: 'lost', 'found', or null/undefined
    actionElements,
  }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const images = useMemo(
      () => (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : []),
      [item.imageUrls]
    );
    const posterName = useMemo(
      () => item.userDisplayName || item.userEmail || "Anonymous",
      [item.userDisplayName, item.userEmail]
    );
    const formattedPrice = useMemo(
      () =>
        !isLostAndFound && item.price != null ? formatPrice(item.price) : null,
      [item.price, isLostAndFound]
    );
    const formattedTime = useMemo(
      () => (item.createdAt ? formatRelativeTime(item.createdAt) : null),
      [item.createdAt]
    );
    const whatsappUrl = useMemo(
      () =>
        item.whatsappNumber
          ? generateWhatsAppURL(item.whatsappNumber, item.name)
          : null,
      [item.whatsappNumber, item.name]
    );

    const nextImage = useCallback(
      (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
      },
      [images.length]
    );

    const prevImage = useCallback(
      (e) => {
        e.stopPropagation();
        setCurrentImageIndex(
          (prevIndex) => (prevIndex - 1 + images.length) % images.length
        );
      },
      [images.length]
    );

    const openImageViewer = useCallback(
      (e) => {
        e.stopPropagation();
        if (images.length > 0) {
          setIsImageViewerOpen(true);
        }
      },
      [images.length]
    );
    const closeImageViewer = useCallback(() => setIsImageViewerOpen(false), []);

    const openDetailModal = useCallback(() => setIsDetailModalOpen(true), []);
    const closeDetailModal = useCallback(() => setIsDetailModalOpen(false), []);

    const handleContactClick = useCallback(() => {
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      } else if (item.whatsappNumber && showMessage) {
        showMessage("Invalid WhatsApp number format.", "error");
      } else if (onContact) {
        onContact(item);
      }
    }, [whatsappUrl, item, onContact, showMessage]);

    const statusIndicatorClass =
      statusIndicator === "lost"
        ? "border-l-4 border-red-400"
        : statusIndicator === "found"
        ? "border-l-4 border-green-400"
        : "";

    return (
      <>
        <div
          className={`bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition-all duration-300 flex flex-col h-full ${statusIndicatorClass} ${className}`}
        >
          <ItemCardHeader
            images={images}
            currentImageIndex={currentImageIndex}
            openImageViewer={openImageViewer}
            onPrevImage={prevImage}
            onNextImage={nextImage}
            onSetCurrentImageIndex={setCurrentImageIndex}
            itemName={item.name}
          />
          <ItemCardDetails
            item={item}
            isLostAndFound={isLostAndFound}
            formattedPrice={formattedPrice}
            formattedTime={formattedTime}
            posterName={posterName}
            hideContactButton={hideContactButton}
            onContactClick={handleContactClick}
            onOpenDetailModal={openDetailModal}
            actionElements={actionElements}
          />
        </div>
        {isImageViewerOpen && (
          <ImageViewer
            images={images}
            initialIndex={currentImageIndex}
            isOpen={isImageViewerOpen}
            onClose={closeImageViewer}
            itemName={item.name || "Item"}
          />
        )}
        {isDetailModalOpen && (
          <ItemDetailModal
            item={item}
            isOpen={isDetailModalOpen}
            onClose={closeDetailModal}
            onContact={onContact}
            isLostAndFound={isLostAndFound}
            showMessage={showMessage}
            hideContactButton={hideContactButton}
            user={user}
          />
        )}
      </>
    );
  }
);
ItemCard.displayName = "ItemCard";
export default ItemCard;
