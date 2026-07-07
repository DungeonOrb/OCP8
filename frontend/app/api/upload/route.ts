import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

function sanitizeFilePart(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .replace(/_+/g, "_");
}

function getExtension(filename: string) {
    const extension = path.extname(filename).toLowerCase();

    if ([".jpg", ".jpeg", ".png", ".webp"].includes(extension)) {
        return extension;
    }

    return ".jpg";
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get("file");
        const propertyId = formData.get("propertyId");
        const imageName = formData.get("imageName");

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "file is required" }, { status: 400 });
        }

        if (typeof propertyId !== "string" || !propertyId) {
            return NextResponse.json(
                { error: "propertyId is required" },
                { status: 400 }
            );
        }

        if (typeof imageName !== "string" || !imageName) {
            return NextResponse.json(
                { error: "imageName is required" },
                { status: 400 }
            );
        }

        const safePropertyId = sanitizeFilePart(propertyId);
        const safeImageName = sanitizeFilePart(imageName);
        const extension = getExtension(file.name);

        const uploadDirectory = path.join(
            process.cwd(),
            "public",
            "uploads",
            "properties",
            `P_${safePropertyId}`
        );

        await mkdir(uploadDirectory, { recursive: true });

        const filename = `P_${safePropertyId}_${safeImageName}${extension}`;
        const filePath = path.join(uploadDirectory, filename);

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/properties/P_${safePropertyId}/${filename}`;

        return NextResponse.json({
            url: publicUrl,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Upload failed" },
            { status: 500 }
        );
    }
}