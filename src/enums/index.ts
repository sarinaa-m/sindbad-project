export const ProviderMessageType = [
    { value: "failed", label: "status: failed - The reservation is currently unavailable." },
    { value: "ok", label: "status: OK - the reservation is confirmed, and your booking is now secure." },
    { value: "success", label: "success - your reservation has been processed." },
    { value: "pending", label: "pending - Your reservation is pending." },
    { value: "retry", label: "reservation failed. Try again later." },
    { value: "cancelled", label: "cancelled - Your reservation has been cancelled." },
    { value: "userCancellation", label: "the reservation was cancelled as per your request." },
    { value: "confirmed", label: "your booking has been successfully processed and confirmed." },
    { value: "rejected", label: "failure - Your reservation has been rejected." },
    { value: "processing", label: "status: processing - waiting for confirmation." },
    { value: "cancelled", label: "status: cancel - The reservation is cancelled." },
]

export enum HeaderName {
    ID = "id",
    FULL_NAME = "first_name",
    ORDER_TYPE = "order_type",
    SUBMISSION_DATE = "submission_datetime",
    PHONE_NUMBER = "phone_number",
    STATUS = "provider_message"
}

export enum StatusType {
    FAILED = "failed",
    OK = "ok",
    SUCCESS = "success",
    PENDING = "pending",
    RETRY = "retry",
    CANCELLED = "cancelled",
    USER_CANCELLATION = "userCancellation",
    CONFIRMED = "confirmed",
    REJECTED = "rejected",
    PROCESSING = "processing"

}

export enum OrderType {
    FLIGHT = "flight",
    HOTEL = "Hotel",
    VISA = "Visa"


}