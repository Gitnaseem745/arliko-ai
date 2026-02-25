// global error handler — catches anything that slips through and returns a 500
export const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    res.status(500).json({
        message: "Internal Server Error"
    });
}
