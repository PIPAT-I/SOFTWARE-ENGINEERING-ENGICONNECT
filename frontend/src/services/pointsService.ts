import apiClient from './apiClient';

export const getTotalPoints = async (userId: number) => {
  return await apiClient
    .get(`/points/total/${userId}`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const addPoint = async (userId: number, points: number) => {
  return await apiClient
    .post(`/points/add/${userId}`, { points })
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const dailyCheckin = async (userId: number) => {
  return await apiClient
    .post(`/points/checkin/${userId}`)
    .then((res) => res.data)
    .catch((e) => {
      const data = e?.response?.data || e.response;
      if (data && data.error === 'already checked in today') {
        return { error: 'already checked in today' };
      }
      return data;
    });
};

export const getMembershipLevel = async (userId: number) => {
  return await apiClient
    .get(`/points/membership/${userId}`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const getPointRecords = async (userId: number) => {
  return await apiClient
    .get(`/points/records/${userId}`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const createReward = async (data: any) => {
  if (data.point_required < 100) {
    return { error: 'กรุณากำหนดจำนวนคะแนนมากกว่า 100' };
  }
  if (data.stock < 1) {
    return { error: 'กรุณากำหนดจำนวนสินค้าคงคลัง' };
  }
  if (!data.reward_name || data.reward_name === '') {
    return { error: 'กรุณาใส่ชื่อรางวัล' };
  }
  if (!data.reward_image && !data.image) {
    return { error: 'กรุณาใส่รูปภาพรางวัล' };
  }

  const formData = new FormData();
  formData.append('reward_name', data.reward_name);
  formData.append('point_required', String(data.point_required));
  formData.append('stock', String(data.stock));
  formData.append('description', data.description || '');
  if (data.image instanceof File) {
    formData.append('reward_image', data.image);
  }

  return await apiClient
    .post(`/points/rewards`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const getRewards = async () => {
  return await apiClient
    .get(`/points/rewards`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const updateReward = async (id: number, data: any) => {
  const formData = new FormData();
  formData.append('reward_name', data.reward_name);
  formData.append('point_required', String(data.point_required));
  formData.append('stock', String(data.stock));
  formData.append('description', data.description || '');
  if (data.reward_image instanceof File) {
    formData.append('reward_image', data.reward_image);
  }

  return await apiClient
    .put(`/points/rewards/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const deleteReward = async (id: number) => {
  return await apiClient
    .delete(`/points/rewards/${id}`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const getPendingPosts = async () => {
  return await apiClient
    .get(`/points/pending_posts`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const getPostsWithPoints = async () => {
  return await apiClient
    .get(`/points/posts_with_points`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const updatePostPoint = async (postId: number, points: number) => {
  return await apiClient
    .put(`/points/post_point/${postId}`, { point: points })
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};

export const redeemReward = async (userId: number, rewardId: number) => {
  return await apiClient
    .post(`/points/reward_redeem`, { user_id: userId, reward_id: rewardId })
    .then((res) => res.data)
    .catch((e) => {
      const data = e?.response?.data || e.response;
      if (data && data.error) return { error: data.error };
      return data;
    });
};

export const getRedeemedRewards = async (userId: number) => {
  return await apiClient
    .get(`/points/redeemed/${userId}`)
    .then((res) => res.data)
    .catch(() => []);
};

export const distributePoints = async (postId: number) => {
  return await apiClient
    .post(`/points/distribute/${postId}`)
    .then((res) => res.data)
    .catch((e) => {
      throw e;
    });
};

export const checkPointsDistributed = async (postId: number) => {
  return await apiClient
    .get(`/points/distributed/${postId}`)
    .then((res) => res.data)
    .catch((e) => e.response?.data || e.response);
};