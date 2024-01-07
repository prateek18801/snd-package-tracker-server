import os from "os";
import mongoose from "mongoose";

const ping = (req, res, next) => {
    return res.status(200).json({
        message: "ok"
    });
}

const health = (req, res, next) => {
    const date = new Date();
    const memoryUsage = process.memoryUsage();
    return res.status(200).json({
        timestamp: date.toISOString(),
        timezone: process.env.TZ,
        server: {
            uptime: process.uptime(),
            version: process.version,
            environment: process.env.NODE_ENV
        },
        memory: {
            rss: `${memoryUsage.rss} (${formatBytes(memoryUsage.rss)})`,
            heap_total: `${memoryUsage.heapTotal} (${formatBytes(memoryUsage.heapTotal)})`,
            heap_used: `${memoryUsage.heapUsed} (${formatBytes(memoryUsage.heapUsed)})`,
            external: `${memoryUsage.external} (${formatBytes(memoryUsage.external)})`,
            array_buffers: `${memoryUsage.arrayBuffers} (${formatBytes(memoryUsage.arrayBuffers)})`
        },
        os: {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus(),
            total_memory: `${os.totalmem()} (${formatBytes(os.totalmem())})`,
            free_memory: `${os.freemem()} (${formatBytes(os.freemem())})`
        },
        database: {
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            state: mongoose.STATES[mongoose.connection.readyState]
        },
        request: {
            headers: req.headers,
            user: req.user,
            body: req.body,
            method: req.method,
            ip: req.ip
        }
    });
}

const formatBytes = (bytes) => {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0B";
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + sizes[i];
}

export {
    ping,
    health
};
