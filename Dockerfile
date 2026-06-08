FROM node:18-alpine

WORKDIR /app

# Sao chép file cấu hình của cả Backend và Worker vào máy chủ
COPY backend/package*.json ./backend/
COPY worker/package*.json ./worker/

# Tiến hành cài đặt thư viện cho từng thư mục
RUN cd backend && npm install --production
RUN cd worker && npm install --production

# Sao chép toàn bộ code vào (Loại trừ thư mục frontend ra để nhẹ máy)
COPY backend/ ./backend/
COPY worker/ ./worker/

# Ép cổng 7860 theo luật của Hugging Face
EXPOSE 7860
ENV PORT=7860

# Lệnh thần thánh: Chạy Backend và Worker song song cùng lúc bằng dấu &
CMD cd backend && node index.js & cd ../worker && node worker.js