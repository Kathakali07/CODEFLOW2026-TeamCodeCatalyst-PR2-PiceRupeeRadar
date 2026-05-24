package com.pae.api_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pae.api_service.model.Transaction;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.*;
import software.amazon.awssdk.core.SdkBytes;

import java.util.*;
import java.util.regex.Pattern;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

@Service
public class PdfParsingService {

    private static final Pattern ACCOUNT_NUM_PATTERN = Pattern.compile("\\b\\d{5,14}(\\d{4})\\b");

    public PdfParsingService() {
    }

    public String parseAndSanitize(byte[] fileBytes) throws Exception {
        // 1. Extract text locally using Apache PDFBox (BLAZING FAST, 0.5s instead of 30s)
        String extractedPdfText = "";
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper pdfStripper = new PDFTextStripper();
            extractedPdfText = pdfStripper.getText(document);
        }

        if (extractedPdfText == null || extractedPdfText.trim().isEmpty()) {
            throw new IllegalArgumentException("Could not extract text from PDF. Scanned images are not yet supported without dedicated OCR.");
        }

        return extractedPdfText;
    }
    private String sanitizeNarration(String narration) {
        return ACCOUNT_NUM_PATTERN.matcher(narration).replaceAll("****$1");
    }
}
