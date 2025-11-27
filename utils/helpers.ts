
import { Campaign, Product } from "../types";

/**
 * Chuyển đổi chuỗi tiếng Việt có dấu thành không dấu
 * Ví dụ: "Điện Tử" -> "dien tu"
 * Giúp tối ưu hóa việc tìm kiếm
 */
export const toNonAccentVietnamese = (str: string): string => {
    str = str.toLowerCase();
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    // Some system encode vietnamese combining accent as individual utf-8 characters
    str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng 
    str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ă, Ơ
    return str;
}

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ
 * Các đầu số: 03, 05, 07, 08, 09 + 8 số
 */
export const isValidVietnamesePhoneNumber = (phone: string): boolean => {
    const vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    return vnf_regex.test(phone);
}

/**
 * Chuyển đổi File object sang Base64 string để lưu preview/localStorage
 */
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

/**
 * Calculate final price and find applicable campaign for a product
 */
export const calculateProductPrice = (product: Product, campaigns: Campaign[]) => {
    // Find best active discount campaign
    const discountCampaign = campaigns.find(c => 
        c.type === 'DISCOUNT_PERCENT' && 
        c.targetProductIds.includes(product.id) &&
        c.isActive
    );

    const giftCampaign = campaigns.find(c =>
        c.type === 'GIFT_VOUCHER' &&
        c.targetProductIds.includes(product.id) &&
        c.isActive
    );

    let finalPrice = product.price;
    let discountPercent = 0;

    if (discountCampaign) {
        discountPercent = discountCampaign.value;
        finalPrice = product.price * (1 - discountPercent / 100);
    }

    return {
        originalPrice: product.price,
        finalPrice,
        discountPercent,
        discountCampaign,
        giftCampaign
    };
};
