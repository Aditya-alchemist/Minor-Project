import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const testAI = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_BASE_URL}/test-ai`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
};

export const getProductInfo = async (productId) => {
    const response = await axios.get(`${API_BASE_URL}/product/${productId}`);
    return response.data;
};

export const checkHealth = async () => {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
};
