import { AIProvider, EvaluationRequest, EvaluationResult, AIErrorItem } from "./types";
import { calculateMQMScore } from "../scoring";

export class MockAIProvider implements AIProvider {
  name = "MockAIProvider (Educational MQM Engine)";

  async evaluateTranslation(request: EvaluationRequest): Promise<EvaluationResult> {
    const { sourceText, studentTranslation, sourceLanguage, targetLanguage, cefrLevel } = request;

    const sourceWords = sourceText.trim().split(/\s+/).filter(Boolean).length;
    const studentWords = studentTranslation.trim().split(/\s+/).filter(Boolean).length;

    const errors: AIErrorItem[] = [];
    const strengths: string[] = [];
    const learningTips: string[] = [];
    const suggestedTranslations: string[] = [];

    // 1. Detect potential omissions or overly brief translations
    if (studentWords < sourceWords * 0.5) {
      const firstChunk = studentTranslation.slice(0, Math.min(30, studentTranslation.length)).trim();
      errors.push({
        category: "ACCURACY",
        subtype: "OMISSION",
        severity: "CRITICAL",
        targetQuote: firstChunk || studentTranslation,
        occurrenceIndex: 0,
        sourceEvidence: sourceText.slice(0, 50),
        explanation: "Bản dịch có vẻ quá ngắn so với văn bản gốc. Nhiều chi tiết và mệnh đề quan trọng đã bị bỏ sót.",
        suggestion: "Hãy dịch đầy đủ tất cả các ý trong đoạn văn bản nguồn.",
      });
    }

    // 2. Bilingual pattern checks for English -> Vietnamese
    if (sourceLanguage === "en" && targetLanguage === "vi") {
      // Check for common word-for-word translation issues
      if (studentTranslation.toLowerCase().includes("trên những đám mây") || studentTranslation.toLowerCase().includes("trên các đám mây")) {
        errors.push({
          category: "STYLE",
          subtype: "INAPPROPRIATE_REGISTER",
          severity: "MINOR",
          targetQuote: studentTranslation.includes("trên những đám mây") ? "trên những đám mây" : "trên các đám mây",
          occurrenceIndex: 0,
          sourceEvidence: "above the clouds",
          explanation: "Cách diễn đạt hơi gượng ép theo cấu trúc tiếng Anh. Trong văn phong du lịch tiếng Việt, có thể diễn đạt bay bổng hơn.",
          suggestion: "giữa biển mây / bồng bềnh giữa trời mây",
        });
      }

      // Check terminology
      if (sourceText.toLowerCase().includes("golden bridge") && !studentTranslation.toLowerCase().includes("cầu vàng")) {
        const firstWords = studentTranslation.split(" ").slice(0, 3).join(" ");
        errors.push({
          category: "TERMINOLOGY",
          subtype: "INCORRECT_TERM",
          severity: "MAJOR",
          targetQuote: firstWords || studentTranslation,
          occurrenceIndex: 0,
          sourceEvidence: "Golden Bridge",
          explanation: "Thiếu hoặc dịch chưa chuẩn danh từ riêng biểu tượng du lịch 'Golden Bridge' (Cầu Vàng tại Bà Nà Hills).",
          suggestion: "Cầu Vàng",
        });
      } else {
        strengths.push("Chuyển ngữ chính xác danh từ riêng và địa danh du lịch nổi tiếng.");
      }

      // Check coastal jewel or dynamic coastal cities
      if (sourceText.toLowerCase().includes("dynamic coastal cities") && studentTranslation.toLowerCase().includes("thành phố ven biển")) {
        strengths.push("Xử lý tốt cụm danh từ 'dynamic coastal cities' phù hợp với ngữ cảnh kinh tế - du lịch.");
      }

      suggestedTranslations.push(
        "Đà Nẵng đã vươn lên thành một trong những thành phố biển năng động bậc nhất Việt Nam, thu hút hàng triệu lượt du khách quốc tế mỗi năm. Được thiên nhiên ưu đãi với những bãi biển nguyên sơ cùng hạ tầng hiện đại, thành phố đã kết hợp hài hòa vẻ đẹp thiên nhiên với sự phát triển kinh tế."
      );
      learningTips.push(
        "Đối với thể loại du lịch, nên ưu tiên các động từ và tính từ gợi hình (chẳng hạn 'vươn lên', 'bồng bềnh', 'ưu ái')."
      );
    } else {
      // Vietnamese -> English
      if (studentTranslation.toLowerCase().includes("foreign language - information technology")) {
        errors.push({
          category: "TERMINOLOGY",
          subtype: "INCORRECT_TERM",
          severity: "MAJOR",
          targetQuote: "foreign language - information technology",
          occurrenceIndex: 0,
          sourceEvidence: "Đại học Ngoại ngữ – Tin học TP. Hồ Chí Minh",
          explanation: "Tên chính thức của trường đại học trong tiếng Anh viết tắt là HUFLIT (Ho Chi Minh City University of Foreign Languages - Information Technology).",
          suggestion: "Ho Chi Minh City University of Foreign Languages – Information Technology (HUFLIT)",
        });
      } else {
        strengths.push("Nhận diện chuẩn xác tên cơ quan / trường đại học và danh xưng học thuật.");
      }

      if (studentTranslation.toLowerCase().includes("critical thinking")) {
        strengths.push("Sử dụng chính xác thuật ngữ học thuật 'critical thinking' cho 'tư duy phản biện'.");
      }

      suggestedTranslations.push(
        "Ho Chi Minh City University of Foreign Languages and Information Technology (HUFLIT) emphasizes developing students' practical translation competencies aligned with digital technologies. By integrating artificial intelligence tools into the curriculum, learners not only enhance their bidirectional translation skills but also cultivate critical thinking and professional post-editing expertise."
      );
      learningTips.push(
        "Trong văn phong học thuật tiếng Anh, hãy chú ý dùng cấu trúc danh từ hóa (nominalization) và các động từ học thuật như 'emphasize', 'cultivate', 'enhance'."
      );
    }

    if (strengths.length === 0) {
      strengths.push("Bản dịch đã chuyển tải được thông điệp cốt lõi của đoạn văn bản nguồn.");
    }

    if (learningTips.length === 0) {
      learningTips.push("Hãy đọc lại bản dịch sau khi hoàn thành để trau chuốt độ trôi chảy và ngữ điệu tự nhiên.");
    }

    const estimatedScore = calculateMQMScore(errors, sourceWords);

    const overallComment =
      estimatedScore >= 85
        ? `Bản dịch đạt chất lượng rất tốt (CEFR ${cefrLevel}). Bạn nắm vững cấu trúc câu, từ vựng và ngữ cảnh. Một vài điểm nhỏ có thể tinh chỉnh để tự nhiên hơn.`
        : estimatedScore >= 70
        ? `Bản dịch đạt mức khá (CEFR ${cefrLevel}). Nội dung chính xác nhưng còn một số chỗ cần cải thiện về thuật ngữ hoặc văn phong để mượt mà hơn.`
        : `Bản dịch cần xem lại (CEFR ${cefrLevel}). Còn tồn tại lỗi về độ chính xác hoặc cấu trúc câu. Hãy tham khảo các gợi ý sửa lỗi bên dưới và tiến hành hậu hiệu đính.`;

    return {
      overallComment,
      strengths,
      errors,
      suggestedTranslations,
      learningTips,
      estimatedScore,
      tokenUsage: {
        promptTokens: Math.round(sourceWords * 2.5),
        completionTokens: Math.round(studentWords * 3),
        totalTokens: Math.round(sourceWords * 2.5 + studentWords * 3),
      },
      estimatedCost: 0.0005,
    };
  }
}
