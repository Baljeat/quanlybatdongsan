const cron = require('node-cron');
const KyGui = require('../models/HopDongKyGuiModel');

// Lên lịch chạy công việc vào 00:01 (1 phút sau nửa đêm) mỗi ngày.
const scheduleStatusUpdates = () => {
  cron.schedule('1 0 * * *', async () => {
    console.log(`[${new Date().toLocaleString('vi-VN')}] Running scheduled job: Update expired contract statuses.`);
    try {
      const result = await KyGui.autoUpdateExpiredStatus();
      if (result.changedRows > 0) {
        console.log(`Successfully updated ${result.changedRows} contract(s) to 'Đã hết hạn'.`);
      }
    } catch (error) {
      console.error('Error running the scheduled status update job:', error);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh" // Quan trọng: Đặt múi giờ Việt Nam để chạy chính xác.
  });
};

module.exports = { scheduleStatusUpdates };