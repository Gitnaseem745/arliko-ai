import mongoose from 'mongoose';

// liveness probe
export const checkHealth = async (req, res) => {
    const data = {
        uptime: process.uptime(),
        message: 'Ok',
        date: new Date()
    }

    res.status(200).send(data);
}

// readiness probe: checks DB connection state
export const checkReadiness = async (req, res) => {
    const state = mongoose.connection.readyState

    // 1 = connected, 2 = connecting
    const ready = state === 1
    if (!ready) {
        return res.status(503).json({ status: 'not_ready', dbState: state })
    }

    res.json({ status: 'ready', dbState: state })
}
