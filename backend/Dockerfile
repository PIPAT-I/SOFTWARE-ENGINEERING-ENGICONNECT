# Build app
FROM golang:1.25 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

ENV CGO_ENABLED=0 GOOS=linux 

RUN go build -o server .


# Run app
FROM alpine:3.22

WORKDIR /app

COPY --from=builder /app/server .
COPY --from=builder /app/assets ./assets

EXPOSE 8080

ENTRYPOINT ["./server"]